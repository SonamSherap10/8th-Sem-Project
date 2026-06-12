const db = require("../../model/index");

const getMyDeliveries = async (req, res) => {
  try {
    const where = { delivery_person_id: req.user.userId };

    if (req.query.status) {
      where.status = req.query.status;
    }

    const deliveries = await db.Delivery.findAll({
      where,
      include: [
        {
          model: db.Order,
          include: [{ model: db.Retailer, attributes: ["name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = deliveries.map((delivery) => ({
      ...delivery.toJSON(),
      retailer_name: delivery.Order?.Retailer?.name,
      order_total: delivery.Order?.total_amount,
    }));

    res.status(200).json({ message: "Deliveries retrieved successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markInTransit = async (req, res) => {
  try {
    const delivery = await db.Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    if (delivery.delivery_person_id !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (delivery.status !== "assigned") {
      return res.status(400).json({ error: "Delivery must be in assigned status" });
    }

    await delivery.update({
      status: "in_transit",
      dispatched_at: new Date(),
    });

    res.status(200).json({ message: "Delivery marked as in transit", data: delivery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markDelivered = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const delivery = await db.Delivery.findByPk(req.params.id, { transaction });

    if (!delivery) {
      await transaction.rollback();
      return res.status(404).json({ error: "Delivery not found" });
    }

    if (delivery.delivery_person_id !== req.user.userId) {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied" });
    }

    if (delivery.status !== "in_transit") {
      await transaction.rollback();
      return res.status(400).json({ error: "Delivery must be in in_transit status" });
    }

    await delivery.update(
      { status: "delivered", delivered_at: new Date() },
      { transaction }
    );

    const order = await db.Order.findByPk(delivery.order_id, { transaction });
    await order.update({ status: "delivered" }, { transaction });
    await transaction.commit();

    res.status(200).json({ message: "Delivery marked as delivered", data: delivery });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMyDeliveries,
  markInTransit,
  markDelivered,
};
