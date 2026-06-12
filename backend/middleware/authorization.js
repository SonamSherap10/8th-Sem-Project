const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = require("../model/index");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ error: "Please login" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await db.User.findByPk(decoded.userId, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist with that token/id" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      region_id: user.region_id,
    };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };
