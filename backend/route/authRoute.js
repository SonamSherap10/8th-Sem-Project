const express = require("express");
const router = express.Router();
const authController = require("../controller/auth/authController");
// const Authorization = require("../middleware/Authorization");

router.post("/register", authController.register);
router.post("/login", authController.login);
// router.get("/validate", Authorization, authController.validate);

module.exports = router;