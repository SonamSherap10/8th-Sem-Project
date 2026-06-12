const db = require("../../model/index");
const { Op } = require("sequelize");

const createRetailer = async (req, res) => {
  try {
    const { name, contact_person, phone, region_id, credit_limit } = req.body;

    if (!name || !region_id) {
      return res.status(400).json({ error: "name and region_id are required" });
    }

    const region = await db.Region.findByPk(region_id);
    if (!region) {
      return res.status(400).json({ error: "region_id does not exist" });
    }

    const limit = credit_limit !== undefined ? Number(credit_limit) : 0;
    if (credit_limit !== undefined && (Number.isNaN(limit) || limit < 0)) {
      return res.status(400).json({ error: "credit_limit must be a positive number" });
    }

    const retailer = await db.Retailer.create({
      name,
      contact_person,
      phone,
      region_id,
      credit_limit: limit,
      current_balance: 0,
    });

    const retailerWithRegion = await db.Retailer.findByPk(retailer.id, {
      include: [{ model: db.Region, attributes: ["name"] }],
    });

    res.status(201).json({ message: "Retailer created successfully", data: retailerWithRegion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllRetailers = async (req, res) => {
  try {
    const where = {};

    if (req.query.region_id) {
      where.region_id = req.query.region_id;
    }

    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === "true";
    }

    const retailers = await db.Retailer.findAll({
      where,
      include: [{ model: db.Region, attributes: ["name"] }],
    });

    res.status(200).json({ message: "Retailers retrieved successfully", data: retailers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRetailerById = async (req, res) => {
  try {
    const retailer = await db.Retailer.findByPk(req.params.id, {
      include: [
        { model: db.Region, attributes: ["name"] },
        {
          model: db.Order,
          attributes: ["id", "order_date", "total_amount", "status"],
        },
      ],
    });

    if (!retailer) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    res.status(200).json({ message: "Retailer retrieved successfully", data: retailer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateRetailer = async (req, res) => {
  try {
    const { name, contact_person, phone, credit_limit } = req.body;

    if (req.body.region_id !== undefined || req.body.current_balance !== undefined) {
      return res.status(400).json({ error: "region_id and current_balance cannot be changed" });
    }

    const retailer = await db.Retailer.findByPk(req.params.id);
    if (!retailer) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    if (credit_limit !== undefined && Number(credit_limit) <= 0) {
      return res.status(400).json({ error: "credit_limit must be a positive number" });
    }

    await retailer.update({
      ...(name !== undefined && { name }),
      ...(contact_person !== undefined && { contact_person }),
      ...(phone !== undefined && { phone }),
      ...(credit_limit !== undefined && { credit_limit }),
    });

    const updatedRetailer = await db.Retailer.findByPk(retailer.id, {
      include: [{ model: db.Region, attributes: ["name"] }],
    });

    res.status(200).json({ message: "Retailer updated successfully", data: updatedRetailer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deactivateRetailer = async (req, res) => {
  try {
    const retailer = await db.Retailer.findByPk(req.params.id);
    if (!retailer) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    if (Number(retailer.current_balance) !== 0) {
      return res.status(400).json({ error: "Retailer has an outstanding balance and cannot be deactivated" });
    }

    await retailer.update({ is_active: false });

    res.status(200).json({ message: "Retailer deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const activateRetailer = async (req, res) => {
  try {
    const retailer = await db.Retailer.findByPk(req.params.id);
    if (!retailer) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    await retailer.update({ is_active: true });

    res.status(200).json({ message: "Retailer activated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createRetailer,
  getAllRetailers,
  getRetailerById,
  updateRetailer,
  deactivateRetailer,
  activateRetailer,
};
