const db = require("../../model/index");
const { Op } = require("sequelize");

const checkNearExpiry = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const cutoffDate = thirtyDaysFromNow.toISOString().split("T")[0];

    const batches = await db.Batch.findAll({
      where: {
        expiry_date: { [Op.lte]: cutoffDate },
        quantity_remaining: { [Op.gt]: 0 },
      },
      include: [{ model: db.Product, attributes: ["name"] }],
    });

    let newAlertsCount = 0;

    for (const batch of batches) {
      const existingAlert = await db.Alert.findOne({
        where: {
          type: "near_expiry",
          reference_id: batch.id,
          reference_type: "batch",
          is_read: false,
        },
      });

      if (!existingAlert) {
        await db.Alert.create({
          type: "near_expiry",
          reference_id: batch.id,
          reference_type: "batch",
          message: `Product ${batch.Product.name} batch ${batch.batch_number} expires on ${batch.expiry_date} with ${batch.quantity_remaining} units remaining`,
        });
        newAlertsCount++;
      }
    }

    res.status(200).json({
      message: "Near expiry check completed",
      data: { new_alerts_created: newAlertsCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const checkLowStock = async (req, res) => {
  try {
    const products = await db.Product.findAll({ where: { is_active: true } });
    let newAlertsCount = 0;

    for (const product of products) {
      const totalStock = await db.Batch.sum("quantity_remaining", {
        where: { product_id: product.id },
      });

      const stock = totalStock || 0;

      if (stock < Number(product.reorder_threshold)) {
        const existingAlert = await db.Alert.findOne({
          where: {
            type: "low_stock",
            reference_id: product.id,
            reference_type: "product",
            is_read: false,
          },
        });

        if (!existingAlert) {
          await db.Alert.create({
            type: "low_stock",
            reference_id: product.id,
            reference_type: "product",
            message: `Product ${product.name} stock is low: ${stock} units remaining, reorder threshold is ${product.reorder_threshold}`,
          });
          newAlertsCount++;
        }
      }
    }

    res.status(200).json({
      message: "Low stock check completed",
      data: { new_alerts_created: newAlertsCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const checkOverduePayments = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const invoices = await db.Invoice.findAll({
      where: {
        due_date: { [Op.lt]: today },
        status: { [Op.ne]: "paid" },
      },
      include: [
        {
          model: db.Order,
          include: [{ model: db.Retailer, attributes: ["name"] }],
        },
      ],
    });

    let newAlertsCount = 0;

    for (const invoice of invoices) {
      const existingAlert = await db.Alert.findOne({
        where: {
          type: "overdue_payment",
          reference_id: invoice.id,
          reference_type: "invoice",
          is_read: false,
        },
      });

      if (!existingAlert) {
        const paid = await db.Payment.sum("amount", { where: { invoice_id: invoice.id } });
        const amountDue = Number(invoice.total_amount) - (paid || 0);
        const retailerName = invoice.Order?.Retailer?.name || "Unknown";

        await db.Alert.create({
          type: "overdue_payment",
          reference_id: invoice.id,
          reference_type: "invoice",
          message: `Invoice ${invoice.invoice_number} for retailer ${retailerName} is overdue. Amount due: ${amountDue}`,
        });
        newAlertsCount++;
      }
    }

    res.status(200).json({
      message: "Overdue payments check completed",
      data: { new_alerts_created: newAlertsCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAlerts = async (req, res) => {
  try {
    const where = {};

    if (req.query.type) {
      where.type = req.query.type;
    }

    if (req.query.is_read !== undefined) {
      where.is_read = req.query.is_read === "false" ? false : req.query.is_read === "true";
    }

    const alerts = await db.Alert.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    const data = await Promise.all(
      alerts.map(async (alert) => {
        const alertData = alert.toJSON();
        let reference_name = null;

        if (alert.reference_type === "product") {
          const product = await db.Product.findByPk(alert.reference_id, { attributes: ["name"] });
          reference_name = product?.name;
        } else if (alert.reference_type === "invoice") {
          const invoice = await db.Invoice.findByPk(alert.reference_id, {
            attributes: ["invoice_number"],
          });
          reference_name = invoice?.invoice_number;
        } else if (alert.reference_type === "batch") {
          const batch = await db.Batch.findByPk(alert.reference_id, {
            include: [{ model: db.Product, attributes: ["name"] }],
          });
          reference_name = batch ? `${batch.Product?.name} (${batch.batch_number})` : null;
        }

        return { ...alertData, reference_name };
      })
    );

    res.status(200).json({ message: "Alerts retrieved successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const markAlertRead = async (req, res) => {
  try {
    const alert = await db.Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    await alert.update({ is_read: true });

    res.status(200).json({ message: "Alert marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  checkNearExpiry,
  checkLowStock,
  checkOverduePayments,
  getAlerts,
  markAlertRead,
};
