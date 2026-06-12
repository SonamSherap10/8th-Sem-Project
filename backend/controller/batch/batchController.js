const db = require("../../model/index");
const { Op, Sequelize } = require("sequelize");

const createBatch = async (req, res) => {
  try {
    const { product_id, batch_number, quantity_received, expiry_date, received_date } = req.body;

    if (!product_id || !batch_number || quantity_received === undefined || !received_date) {
      return res.status(400).json({
        error: "product_id, batch_number, quantity_received, and received_date are required",
      });
    }

    if (Number(quantity_received) <= 0) {
      return res.status(400).json({ error: "quantity_received must be greater than 0" });
    }

    const product = await db.Product.findByPk(product_id);
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    if (product.is_perishable && !expiry_date) {
      return res.status(400).json({ error: "expiry_date is required for perishable products" });
    }

    const batch = await db.Batch.create({
      product_id,
      batch_number,
      quantity_received,
      quantity_remaining: quantity_received,
      expiry_date: product.is_perishable ? expiry_date : null,
      received_date,
    });

    const batchWithProduct = await db.Batch.findByPk(batch.id, {
      include: [{ model: db.Product, attributes: ["name"] }],
    });

    res.status(201).json({ message: "Batch created successfully", data: batchWithProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBatches = async (req, res) => {
  try {
    const where = {};
    const include = [{ model: db.Product, attributes: ["name", "reorder_threshold"] }];

    if (req.query.product_id) {
      where.product_id = req.query.product_id;
    }

    if (req.query.expiring_soon === "true") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expiry_date = { [Op.lte]: thirtyDaysFromNow.toISOString().split("T")[0] };
      where.quantity_remaining = { [Op.gt]: 0 };
    }

    let batches = await db.Batch.findAll({ where, include });

    if (req.query.low_stock === "true") {
      batches = batches.filter(
        (batch) => Number(batch.quantity_remaining) <= Number(batch.Product.reorder_threshold)
      );
    }

    res.status(200).json({ message: "Batches retrieved successfully", data: batches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBatchById = async (req, res) => {
  try {
    const batch = await db.Batch.findByPk(req.params.id, {
      include: [{ model: db.Product, attributes: ["name"] }],
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.status(200).json({ message: "Batch retrieved successfully", data: batch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBatchesByProduct = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const order = product.is_perishable
      ? [["expiry_date", "ASC"]]
      : [["received_date", "ASC"]];

    const batches = await db.Batch.findAll({
      where: { product_id: req.params.product_id },
      include: [{ model: db.Product, attributes: ["name"] }],
      order,
    });

    res.status(200).json({ message: "Batches retrieved successfully", data: batches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const adjustBatchQuantity = async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    if (quantity === undefined || !reason) {
      return res.status(400).json({ error: "quantity and reason are required" });
    }

    if (Number(quantity) < 0) {
      return res.status(400).json({ error: "quantity must be a non-negative number" });
    }

    const batch = await db.Batch.findByPk(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    await batch.update({ quantity_remaining: quantity });

    const updatedBatch = await db.Batch.findByPk(batch.id, {
      include: [{ model: db.Product, attributes: ["name"] }],
    });

    res.status(200).json({ message: "Batch quantity adjusted successfully", data: updatedBatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  getBatchesByProduct,
  adjustBatchQuantity,
};
