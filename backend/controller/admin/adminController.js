const userController = require("./adminUserController");
const productController = require("./adminProductController");
const salesController = require("./adminSalesController");

module.exports = {
  ...userController,
  ...productController,
  ...salesController,
};
