const express = require("express");
const router = express.Router();
const paymentController = require("../controller/payment/paymentController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.post("/", verifyToken, verifyRole("sales_rep"), paymentController.recordPayment);
router.get("/my-collections", verifyToken, verifyRole("sales_rep"), paymentController.getMyCollections);
router.get("/invoice/:invoice_id", verifyToken, verifyRole("sales_rep"), paymentController.getPaymentsByInvoice);

module.exports = router;
