const db = require("../../model/index");
const { Op } = require("sequelize");

const createProduct = async (req, res) => {
  try {
    const { name, category, unit, is_perishable, reorder_threshold,price } = req.body;

    if (!name || !unit || is_perishable === undefined || is_perishable === null) {
      return res.status(400).json({ error: "name, unit, and is_perishable are required" });
    }

    if (typeof is_perishable !== "boolean") {
      return res.status(400).json({ error: "is_perishable must be a boolean (true or false)" });
    }

    if (reorder_threshold === undefined || reorder_threshold === null || Number(reorder_threshold) <= 0) {
      return res.status(400).json({ error: "reorder_threshold must be a positive number" });
    }

    const product = await db.Product.create({
      name,
      category,
      unit,
      is_perishable,
      reorder_threshold,
      price
    });

    res.status(201).json({ message: "Product created successfully", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const where = {};

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.is_perishable !== undefined) {
      where.is_perishable = req.query.is_perishable === "true";
    }

    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === "true";
    }

    const products = await db.Product.findAll({ where });

    res.status(200).json({ message: "Products retrieved successfully", data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const totalStock = await db.Batch.sum("quantity_remaining", {
      where: {
        product_id: req.params.id,
        quantity_remaining: { [Op.gt]: 0 },
      },
    });

    res.status(200).json({
      message: "Product retrieved successfully",
      data: {
        ...product.toJSON(),
        total_stock: totalStock || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (req.body.is_perishable !== undefined) {
      return res.status(400).json({ error: "is_perishable cannot be changed after creation" });
    }

    const { name, category, unit, reorder_threshold,price } = req.body;

    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (reorder_threshold !== undefined && Number(reorder_threshold) <= 0) {
      return res.status(400).json({ error: "reorder_threshold must be a positive number" });
    }

    await product.update({
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(unit !== undefined && { unit }),
      ...(reorder_threshold !== undefined && { reorder_threshold }),
      ...(price !== undefined && { price }),
    });

    res.status(200).json({ message: "Product updated successfully", data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deactivateProduct = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const totalStock = await db.Batch.sum("quantity_remaining", {
      where: { product_id: req.params.id },
    });

    if (totalStock > 0) {
      return res.status(400).json({ error: "Product still has remaining stock" });
    }

    await product.update({ is_active: false });

    res.status(200).json({ message: "Product deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const activateProduct = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.update({ is_active: true });

    res.status(200).json({ message: "Product activated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
  activateProduct,
}; 
