const express = require("express");
const router = express.Router();
const deliveryController = require("../controller/delivery/deliveryController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.get("/", verifyToken, verifyRole("delivery"), deliveryController.getMyDeliveries);
router.put("/:id/in-transit", verifyToken, verifyRole("delivery"), deliveryController.markInTransit);
router.put("/:id/delivered", verifyToken, verifyRole("delivery"), deliveryController.markDelivered);

module.exports = router;
