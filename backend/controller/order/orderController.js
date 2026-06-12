const db = require("../../model/index");
const { Op, Sequelize } = require("sequelize");

const createOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { retailer_id, items } = req.body;

    if (!retailer_id || !items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "retailer_id and a non-empty items array are required" });
    }

    const salesRep = await db.User.findByPk(req.user.userId, { transaction });
    const retailer = await db.Retailer.findByPk(retailer_id, { transaction });

    if (!retailer || !retailer.is_active) {
      await transaction.rollback();
      return res.status(400).json({ error: "Retailer not found or inactive" });
    }

    if (retailer.region_id !== salesRep.region_id) {
      await transaction.rollback();
      return res.status(400).json({ error: "Retailer is not in your assigned region" });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { product_id, quantity, unit_price } = item;

      if (!product_id || !quantity || unit_price === undefined) {
        await transaction.rollback();
        return res.status(400).json({ error: "Each item requires product_id, quantity, and unit_price" });
      }

      if (Number(quantity) <= 0 || Number(unit_price) <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "quantity and unit_price must be greater than 0" });
      }

      const product = await db.Product.findByPk(product_id, { transaction });
      if (!product || !product.is_active) {
        await transaction.rollback();
        return res.status(400).json({ error: `Product ${product_id} not found or inactive` });
      }

      const lineTotal = Number(quantity) * Number(unit_price);
      totalAmount += lineTotal;
      orderItemsData.push({ product_id, quantity, unit_price, line_total: lineTotal });
    }

    const newBalance = Number(retailer.current_balance) + totalAmount;
    if (newBalance > Number(retailer.credit_limit)) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Credit limit exceeded. Limit: ${retailer.credit_limit}, Current balance: ${retailer.current_balance}, Order amount: ${totalAmount}`,
      });
    }

    const order = await db.Order.create(
      {
        retailer_id,
        sales_rep_id: req.user.userId,
        status: "confirmed",
        total_amount: totalAmount,
      },
      { transaction }
    );

    for (const itemData of orderItemsData) {
      await db.OrderItem.create(
        { order_id: order.id, batch_id: null, ...itemData },
        { transaction }
      );
    }

    await retailer.update({ current_balance: newBalance }, { transaction });
    await transaction.commit();

    const fullOrder = await db.Order.findByPk(order.id, {
      include: [
        { model: db.Retailer, attributes: ["name"] },
        { model: db.OrderItem, include: [{ model: db.Product, attributes: ["name"] }] },
      ],
    });

    res.status(201).json({ message: "Order created successfully", data: fullOrder });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const where = { sales_rep_id: req.user.userId };

    if (req.query.retailer_id) {
      where.retailer_id = req.query.retailer_id;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.date) {
      where[Op.and] = [
        Sequelize.where(Sequelize.fn("DATE", Sequelize.col("order_date")), req.query.date),
      ];
    }

    const orders = await db.Order.findAll({
      where,
      include: [
        { model: db.Retailer, attributes: ["name"] },
        { model: db.OrderItem, attributes: ["id"] },
      ],
      order: [["order_date", "DESC"]],
    });

    const data = orders.map((order) => ({
      ...order.toJSON(),
      item_count: order.OrderItems.length,
      OrderItems: undefined,
    }));

    res.status(200).json({ message: "Orders retrieved successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id, {
      include: [
        { model: db.Retailer, attributes: ["name"] },
        {
          model: db.OrderItem,
          include: [{ model: db.Product, attributes: ["name"] }],
        },
        { model: db.Invoice },
        { model: db.Delivery },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.sales_rep_id !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({ message: "Order retrieved successfully", data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const cancelOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(req.params.id, { transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.sales_rep_id !== req.user.userId) {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied" });
    }

    if (order.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    const retailer = await db.Retailer.findByPk(order.retailer_id, { transaction });
    await retailer.update(
      { current_balance: Number(retailer.current_balance) - Number(order.total_amount) },
      { transaction }
    );
    await order.update({ status: "cancelled" }, { transaction });
    await transaction.commit();

    res.status(200).json({ message: "Order cancelled successfully", data: order });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyRetailers = async (req, res) => {
  try {
    const retailers = await db.Retailer.findAll({
      where: { region_id: req.user.region_id, is_active: true },
      attributes: ["id", "name", "contact_person", "phone", "credit_limit", "current_balance"],
    });

    res.status(200).json({ message: "Retailers retrieved successfully", data: retailers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
  getMyRetailers,
};
