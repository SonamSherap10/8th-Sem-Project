const db = require("../../model/index");
const { Op, Sequelize } = require("sequelize");

const getAllInvoices = async (req, res) => {
  try {
    const where = {};
    const orderWhere = {};

    if (req.user.role === "sales_rep") {
      orderWhere.sales_rep_id = req.user.userId;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.overdue === "true") {
      const today = new Date().toISOString().split("T")[0];
      where.due_date = { [Op.lt]: today };
      where.status = { [Op.ne]: "paid" };
    }

    const invoices = await db.Invoice.findAll({
      where,
      include: [
        {
          model: db.Order,
          where: Object.keys(orderWhere).length ? orderWhere : undefined,
          required: req.user.role === "sales_rep",
          include: [
            { model: db.Retailer, attributes: ["name"] },
            { model: db.User, as: "SalesRep", attributes: ["name"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = invoices.map((invoice) => ({
      ...invoice.toJSON(),
      retailer_name: invoice.Order?.Retailer?.name,
      sales_rep_name: invoice.Order?.SalesRep?.name,
    }));

    res.status(200).json({ message: "Invoices retrieved successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await db.Invoice.findByPk(req.params.id, {
      include: [
        {
          model: db.Order,
          include: [
            { model: db.Retailer, attributes: ["name"] },
            { model: db.User, as: "SalesRep", attributes: ["name"] },
          ],
        },
        { model: db.Payment },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (req.user.role === "sales_rep" && invoice.Order.sales_rep_id !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({ message: "Invoice retrieved successfully", data: invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getInvoiceByOrder = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.order_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (req.user.role === "sales_rep" && order.sales_rep_id !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const invoice = await db.Invoice.findOne({
      where: { order_id: req.params.order_id },
      include: [
        {
          model: db.Order,
          include: [
            { model: db.Retailer, attributes: ["name"] },
            { model: db.User, as: "SalesRep", attributes: ["name"] },
          ],
        },
        { model: db.Payment },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found for this order" });
    }

    res.status(200).json({ message: "Invoice retrieved successfully", data: invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByOrder,
};
