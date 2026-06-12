const express = require("express");
const router = express.Router();
const alertController = require("../controller/alert/alertController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.post("/check-expiry", verifyToken, verifyRole("admin"), alertController.checkNearExpiry);
router.post("/check-low-stock", verifyToken, verifyRole("admin"), alertController.checkLowStock);
router.post("/check-overdue", verifyToken, verifyRole("admin"), alertController.checkOverduePayments);
router.get("/", verifyToken, verifyRole("admin"), alertController.getAlerts);
router.put("/:id/read", verifyToken, verifyRole("admin"), alertController.markAlertRead);

module.exports = router;
