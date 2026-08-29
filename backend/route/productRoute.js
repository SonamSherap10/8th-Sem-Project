const express = require("express");
const router = express.Router();
const productController = require("../controller/admin/adminProductController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.get("/", verifyToken, verifyRole("admin", "sales_rep", "warehouse"), productController.getAllProducts);

module.exports = router;
