const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin/adminController");
const { verifyToken, verifyRole } = require("../middleware/authorization");

router.use(verifyToken, verifyRole("admin"));

// Users
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.put("/users/:id/role", adminController.updateUser);
router.patch("/users/:id/password", adminController.changeUserPassword);
router.patch("/users/:id/deactivate", adminController.deactivateUser);
router.patch("/users/:id/activate", adminController.activateUser);

// Products
router.post("/products", adminController.createProduct);
router.get("/products", adminController.getAllProducts);
router.get("/products/:id", adminController.getProductById);
router.put("/products/:id", adminController.updateProduct);
router.patch("/products/:id/deactivate", adminController.deactivateProduct);
router.patch("/products/:id/activate", adminController.activateProduct);
router.get("/get-all-orders", adminController.getAllOrders);
router.get("/orders/:id", adminController.getOrderById);

// Sales targets & reports
router.get("/sales-report", adminController.getOverallSalesReport);
router.post("/sales-targets", adminController.setTarget);
router.get("/sales-targets/performance/:user_id", adminController.getRepPerformance);
router.get("/sales-targets", adminController.getAllTargets);
router.get("/sales-targets/:id", adminController.getTargetById);
router.put("/sales-targets/:id", adminController.updateTarget);
router.delete("/sales-targets/:id", adminController.deleteTarget);
router.post("/regions", adminController.createRegion);

module.exports = router;