const express = require("express");
const router = express.Router();
const batchController = require("../controller/batch/batchController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.post("/", verifyToken, verifyRole("warehouse", "admin"), batchController.createBatch);
router.get("/", verifyToken, verifyRole("warehouse", "admin"), batchController.getAllBatches);
router.get("/product/:product_id", verifyToken, verifyRole("warehouse", "admin"), batchController.getBatchesByProduct);
router.get("/:id", verifyToken, verifyRole("warehouse", "admin"), batchController.getBatchById);
router.put("/:id/adjust", verifyToken, verifyRole("admin"), batchController.adjustBatchQuantity);

module.exports = router;
