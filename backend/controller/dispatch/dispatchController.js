const db = require("../../model/index");
const { Op } = require("sequelize");

const allocateBatchesForItem = async (orderItem, product, transaction) => {
  const orderBy = product.is_perishable
    ? [["expiry_date", "ASC"]]
    : [["received_date", "ASC"]];

  const batches = await db.Batch.findAll({
    where: {
      product_id: product.id,
      quantity_remaining: { [Op.gt]: 0 },
    },
    order: orderBy,
    transaction,
  });

  const totalAvailable = batches.reduce((sum, b) => sum + Number(b.quantity_remaining), 0);
  if (totalAvailable < orderItem.quantity) {
    console.log(totalAvailable, orderItem.quantity);
    return { error: `Insufficient stock for product ${product.name}` };
  }

  const allocations = [];
  let remaining = orderItem.quantity;

  for (const batch of batches) {
    if (remaining <= 0) break;

    const take = Math.min(remaining, Number(batch.quantity_remaining));
    await batch.update(
      { quantity_remaining: Number(batch.quantity_remaining) - take },
      { transaction }
    );
    allocations.push({ batch, quantity: take });
    remaining -= take;
  }

  return { allocations };
};

const dispatchOrder = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const orderId = req.params.order_id;

    const order = await db.Order.findByPk(orderId, {
      include: [
        { model: db.OrderItem, include: [{ model: db.Product }] },
        { model: db.Retailer },
      ],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "confirmed") {
      await transaction.rollback();
      return res.status(400).json({ error: "Order must be confirmed before dispatch" });
    }

    const batchAllocations = [];

    for (const orderItem of order.OrderItems) {
      const result = await allocateBatchesForItem(orderItem, orderItem.Product, transaction);
      if (result.error) {
        await transaction.rollback();
        return res.status(400).json({ error: result.error });
      }

      const { allocations } = result;

      await orderItem.update(
        {
          batch_id: allocations[0].batch.id,
          quantity: allocations[0].quantity,
          line_total: allocations[0].quantity * Number(orderItem.unit_price),
        },
        { transaction }
      );

      batchAllocations.push({
        product: orderItem.Product.name,
        batch_number: allocations[0].batch.batch_number,
        quantity: allocations[0].quantity,
      });

      for (let i = 1; i < allocations.length; i++) {
        await db.OrderItem.create(
          {
            order_id: order.id,
            product_id: orderItem.product_id,
            batch_id: allocations[i].batch.id,
            quantity: allocations[i].quantity,
            unit_price: orderItem.unit_price,
            line_total: allocations[i].quantity * Number(orderItem.unit_price),
          },
          { transaction }
        );

        batchAllocations.push({
          product: orderItem.Product.name,
          batch_number: allocations[i].batch.batch_number,
          quantity: allocations[i].quantity,
        });
      }
    }

    await order.update({ status: "dispatched" }, { transaction });

    const invoiceCount = await db.Invoice.count({ transaction });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await db.Invoice.create(
      {
        order_id: order.id,
        invoice_number: invoiceNumber,
        total_amount: order.total_amount,
        due_date: dueDate.toISOString().split("T")[0],
        status: "unpaid",
      },
      { transaction }
    );

    const deliveryPerson = await db.User.findOne({
      where: {
        role: "delivery",
        region_id: order.Retailer.region_id,
        is_active: true,
      },
      attributes: { exclude: ["password_hash"] },
      transaction,
    });

    if (!deliveryPerson) {
      await transaction.rollback();
      return res.status(400).json({
        error: "No active delivery person found for the retailer's region",
      });
    }

    const delivery = await db.Delivery.create(
      {
        order_id: order.id,
        delivery_person_id: deliveryPerson.id,
        status: "assigned",
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      message: "Order dispatched successfully",
      data: {
        order_id: order.id,
        batch_allocations: batchAllocations,
        invoice_number: invoice.invoice_number,
        delivery_person: deliveryPerson.name,
        delivery_id: delivery.id,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getDispatchSummary = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderItems = await db.OrderItem.findAll({
      where: { order_id: req.params.order_id },
      include: [
        { model: db.Product, attributes: ["name"] },
        {
          model: db.Batch,
          attributes: ["batch_number", "expiry_date", "received_date"],
        },
      ],
    });

    res.status(200).json({ message: "Dispatch summary retrieved successfully", data: orderItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  dispatchOrder,
  getDispatchSummary,
};
