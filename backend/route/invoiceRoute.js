const express = require("express");
const router = express.Router();
const invoiceController = require("../controller/invoice/invoiceController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.get("/", verifyToken, verifyRole("admin", "sales_rep"), invoiceController.getAllInvoices);
router.get("/order/:order_id", verifyToken, verifyRole("admin", "sales_rep"), invoiceController.getInvoiceByOrder);
router.get("/:id", verifyToken, verifyRole("admin", "sales_rep"), invoiceController.getInvoiceById);

module.exports = router;
