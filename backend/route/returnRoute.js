const express = require("express");
const router = express.Router();
const returnController = require("../controller/return/returnController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.post("/", verifyToken, verifyRole("sales_rep"), returnController.createReturn);
router.get("/pending", verifyToken, verifyRole("warehouse"), returnController.getPendingReturns);
router.put("/:id/process", verifyToken, verifyRole("warehouse"), returnController.processReturn);

module.exports = router;
