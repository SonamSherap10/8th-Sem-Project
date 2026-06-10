const jwt = require("jsonwebtoken")
const {promisify} = require("util")
const db = require("../model/index")
const User = db.User

const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: "Please login" });
  }
  const token = authHeader.split(" ")[1]; 
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET );
    const doesUserExist = await User.findAll({ where: { id: decoded.userId } });
    if (!doesUserExist || doesUserExist.length === 0) {
      return res.status(404).json({ message: "User doesn't exist with that token/id" });
    }
    req.user = doesUserExist;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = isAuthenticated;