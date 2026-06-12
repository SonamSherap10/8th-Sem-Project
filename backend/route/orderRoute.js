const express = require("express");
const router = express.Router();
const orderController = require("../controller/order/orderController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.post("/", verifyToken, verifyRole("sales_rep"), orderController.createOrder);
router.get("/my-retailers", verifyToken, verifyRole("sales_rep"), orderController.getMyRetailers);
router.get("/", verifyToken, verifyRole("sales_rep"), orderController.getAllOrders);
router.get("/:id", verifyToken, verifyRole("sales_rep"), orderController.getOrderById);
router.put("/:id/cancel", verifyToken, verifyRole("sales_rep"), orderController.cancelOrder);

module.exports = router;
