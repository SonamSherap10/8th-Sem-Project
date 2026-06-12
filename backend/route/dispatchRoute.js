const express = require("express");
const router = express.Router();
const dispatchController = require("../controller/dispatch/dispatchController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.post("/:order_id", verifyToken, verifyRole("warehouse"), dispatchController.dispatchOrder);
router.get("/:order_id/summary", verifyToken, verifyRole("warehouse", "admin"), dispatchController.getDispatchSummary);

module.exports = router;
