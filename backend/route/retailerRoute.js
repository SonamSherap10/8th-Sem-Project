const express = require("express");
const router = express.Router();
const retailerController = require("../controller/retailer/retailerController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.post("/", verifyToken, verifyRole("admin"), retailerController.createRetailer);
router.get("/", verifyToken, verifyRole("admin"), retailerController.getAllRetailers);
router.get("/:id", verifyToken, verifyRole("admin"), retailerController.getRetailerById);
router.put("/:id", verifyToken, verifyRole("admin"), retailerController.updateRetailer);
router.put("/:id/deactivate", verifyToken, verifyRole("admin"), retailerController.deactivateRetailer);
router.put("/:id/activate", verifyToken, verifyRole("admin"), retailerController.activateRetailer);

module.exports = router;
