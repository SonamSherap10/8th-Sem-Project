const db = require("../../model/index");

const createReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { order_id, reason, items } = req.body;

    if (!order_id || !reason || !items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "order_id, reason, and a non-empty items array are required" });
    }

    const order = await db.Order.findByPk(order_id, {
      include: [{ model: db.OrderItem }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.sales_rep_id !== req.user.userId) {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied" });
    }

    if (order.status !== "delivered") {
      await transaction.rollback();
      return res.status(400).json({ error: "Returns are only allowed for delivered orders" });
    }

    let creditNoteAmount = 0;
    const returnItemsData = [];

    for (const item of items) {
      const { product_id, batch_id, quantity } = item;

      if (!product_id || quantity === undefined) {
        await transaction.rollback();
        return res.status(400).json({ error: "Each item requires product_id and quantity" });
      }

      if (Number(quantity) <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "quantity must be greater than 0" });
      }
     const orderItem = order.OrderItems.find((oi) => Number(oi.get("product_id")) === Number(product_id));
      if (!orderItem) {
        await transaction.rollback();
        return res.status(400).json({ error: `Product ${product_id} was not in the original order` });
      }

      const priorReturnItems = await db.ReturnItem.findAll({
        where: { product_id },
        include: [
          {
            model: db.Return,
            where: { order_id },
            attributes: [],
          },
        ],
        transaction,
      });

      const alreadyReturned = priorReturnItems.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
      );
      if (alreadyReturned + Number(quantity) > orderItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Return quantity for product ${product_id} exceeds original ordered quantity`,
        });
      }

      const lineCredit = Number(quantity) * Number(orderItem.unit_price);
      creditNoteAmount += lineCredit;
      returnItemsData.push({ product_id, batch_id: batch_id || null, quantity });
    }

    const returnRecord = await db.Return.create(
      {
        order_id,
        retailer_id: order.retailer_id,
        sales_rep_id: req.user.userId,
        reason,
        warehouse_action: null,
        credit_note_amount: creditNoteAmount,
      },
      { transaction }
    );

    for (const itemData of returnItemsData) {
      await db.ReturnItem.create(
        { return_id: returnRecord.id, ...itemData },
        { transaction }
      );
    }

    const retailer = await db.Retailer.findByPk(order.retailer_id, { transaction });
    await retailer.update(
      { current_balance: Number(retailer.current_balance) - creditNoteAmount },
      { transaction }
    );

    await transaction.commit();

    const fullReturn = await db.Return.findByPk(returnRecord.id, {
      include: [
        {
          model: db.ReturnItem,
          include: [{ model: db.Product, attributes: ["name"] }],
        },
      ],
    });

    res.status(201).json({ message: "Return created successfully", data: fullReturn });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPendingReturns = async (req, res) => {
  try {
    const returns = await db.Return.findAll({
      where: { warehouse_action: null },
      include: [
        { model: db.Retailer, attributes: ["name"] },
        { model: db.User, as: "SalesRep", attributes: ["name"] },
        {
          model: db.ReturnItem,
          include: [{ model: db.Product, attributes: ["name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ message: "Pending returns retrieved successfully", data: returns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const processReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { warehouse_action } = req.body;

    if (!warehouse_action || !["restocked", "written_off"].includes(warehouse_action)) {
      await transaction.rollback();
      return res.status(400).json({ error: "warehouse_action must be restocked or written_off" });
    }

    const returnRecord = await db.Return.findByPk(req.params.id, {
      include: [{ model: db.ReturnItem }],
      transaction,
    });

    if (!returnRecord) {
      await transaction.rollback();
      return res.status(404).json({ error: "Return not found" });
    }

    if (returnRecord.warehouse_action !== null) {
      await transaction.rollback();
      return res.status(400).json({ error: "Return has already been processed" });
    }

    if (warehouse_action === "restocked") {
      for (const item of returnRecord.ReturnItems) {
        if (item.batch_id) {
          const batch = await db.Batch.findByPk(item.batch_id, { transaction });
          if (batch) {
            await batch.update(
              { quantity_remaining: Number(batch.quantity_remaining) + Number(item.quantity) },
              { transaction }
            );
          }
        }
      }
    }

    await returnRecord.update({ warehouse_action }, { transaction });
    await transaction.commit();

    const updatedReturn = await db.Return.findByPk(returnRecord.id, {
      include: [
        { model: db.ReturnItem, include: [{ model: db.Product, attributes: ["name"] }] },
      ],
    });

    res.status(200).json({ message: "Return processed successfully", data: updatedReturn });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createReturn,
  getPendingReturns,
  processReturn,
};
