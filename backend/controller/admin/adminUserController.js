const db = require("../../model/index");
const bcrypt = require("bcrypt");

const ALLOWED_ROLES = ["sales_rep", "warehouse", "delivery"];
const SALT_ROUNDS = 10;

const getAllUsers = async (req, res) => {
  try {
    const where = {};

    if (req.query.role) {
      where.role = req.query.role;
    }

    if (req.query.is_active !== undefined) {
      where.is_active = req.query.is_active === "true";
    }

    const users = await db.User.findAll({
      where,
      attributes: { exclude: ["password_hash"] },
    });

    res.status(200).json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, region_id } = req.body;

    if (req.body.password_hash !== undefined) {
      return res.status(400).json({ error: "password_hash cannot be updated from this endpoint" });
    }

    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ error: "Admin users cannot be modified" });
    }

    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        console
        return res.status(400).json({ error: "role must be one of sales_rep, warehouse, or delivery" });
      }

      const effectiveRegionId = region_id !== undefined ? region_id : user.region_id;
      if ((role === "sales_rep" || role === "delivery") && !effectiveRegionId) {
        return res.status(400).json({ error: "region_id is required for sales_rep and delivery roles" });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered" });
      }
    }

    await user.update({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(region_id !== undefined && { region_id }),
    });

    const updatedUser = await db.User.findByPk(user.id, {
      attributes: { exclude: ["password_hash"] },
    });

    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ error: "new_password is required" });
    }

    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
    await user.update({ password_hash: hashedPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ error: "Admin users cannot be deactivated" });
    }

    await user.update({ is_active: false });

    res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const activateUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.update({ is_active: true });

    res.status(200).json({ message: "User activated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  changeUserPassword,
  deactivateUser,
  activateUser,
};