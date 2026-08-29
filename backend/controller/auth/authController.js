const db = require("../../model/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password_hash } = req.body;

    if (!email || !password_hash) {
      return res.status(400).json({ error: "All fields are required" });
  }
   
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedpassword = await bcrypt.hash(password_hash, 10);

    const user = await db.User.create({
    name,
    email,
      password_hash: hashedpassword,
    
  });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error "+error.message });
  }
};

const login = async (req, res) => {
  try {
  const { email, password_hash } = req.body;
  if (!email || !password_hash) { 
      return res.status(400).json({ error: "Email and password_hash are required" });
  }

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials no user" });
  }
   if(user.is_active == 0 ){
    return res.status(400).json({
      error:"please wait for the admin to approve your id"
    })
   }
    const ispassword_hashValid = await bcrypt.compare(password_hash, user.password_hash);
    if (!ispassword_hashValid) {
      return res.status(401).json({ error: "Invalid credentials" }); 
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET ,
      { expiresIn: "24h" }
    );
 
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const validate = async (req, res) => {
  try {
    const user = Array.isArray(req.user) ? req.user[0] : req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  validate
};