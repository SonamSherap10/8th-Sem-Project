const db = require("../../model/index");
const { Op, Sequelize } = require("sequelize");

const recordPayment = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { invoice_id, amount, method } = req.body;

    if (!invoice_id || amount === undefined || !method) {
      await transaction.rollback();
      return res.status(400).json({ error: "invoice_id, amount, and method are required" });
    }

    if (Number(amount) <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "amount must be greater than 0" });
    }

    const invoice = await db.Invoice.findByPk(invoice_id, {
      include: [{ model: db.Order }],
      transaction,
    });

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.Order.sales_rep_id !== req.user.userId) {
      await transaction.rollback();
      return res.status(403).json({ error: "Access denied" });
    }

    const alreadyPaid = await db.Payment.sum("amount", {
      where: { invoice_id },
      transaction,
    });

    const paidSoFar = alreadyPaid || 0;
    const remaining = Number(invoice.total_amount) - paidSoFar;

    if (Number(amount) > remaining) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Overpayment. Remaining balance: ${remaining}`,
      });
    }

    const payment = await db.Payment.create(
      {
        retailer_id: invoice.Order.retailer_id,
        invoice_id,
        collected_by: req.user.userId,
        amount,
        method,
      },
      { transaction }
    );

    const totalPaid = paidSoFar + Number(amount);
    const newStatus = totalPaid >= Number(invoice.total_amount) ? "paid" : "partial";
    await invoice.update({ status: newStatus }, { transaction });

    const retailer = await db.Retailer.findByPk(invoice.Order.retailer_id, { transaction });
    await retailer.update(
      { current_balance: Number(retailer.current_balance) - Number(amount) },
      { transaction }
    );

    await transaction.commit();

    const paymentData = await db.Payment.findByPk(payment.id, {
      include: [{ model: db.Invoice, attributes: ["id", "invoice_number", "status", "total_amount"] }],
    });

    res.status(201).json({ message: "Payment recorded successfully", data: paymentData });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPaymentsByInvoice = async (req, res) => {
  try {
    const invoice = await db.Invoice.findByPk(req.params.invoice_id, {
      include: [{ model: db.Order }],
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.Order.sales_rep_id !== req.user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const payments = await db.Payment.findAll({
      where: { invoice_id: req.params.invoice_id },
      order: [["payment_date", "DESC"]],
    });

    res.status(200).json({ message: "Payments retrieved successfully", data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyCollections = async (req, res) => {
  try {
    const where = { collected_by: req.user.userId };

    if (req.query.month) {
      where[Op.and] = [
        ...(where[Op.and] || []),
        Sequelize.where(
          Sequelize.fn("MONTH", Sequelize.col("payment_date")),
          Number(req.query.month)
        ),
      ];
    }

    if (req.query.year) {
      where[Op.and] = [
        ...(where[Op.and] || []),
        Sequelize.where(
          Sequelize.fn("YEAR", Sequelize.col("payment_date")),
          Number(req.query.year)
        ),
      ];
    }

    console.log("getMyCollections - where clause:", where);

    const payments = await db.Payment.findAll({
      where,
      include: [
        { model: db.Retailer, attributes: ["name"] },
        { model: db.Invoice, attributes: ["invoice_number"] },
      ],
      order: [["payment_date", "DESC"]],
    });

    res.status(200).json({ message: "Collections retrieved successfully", data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  recordPayment,
  getPaymentsByInvoice,
  getMyCollections,
};
