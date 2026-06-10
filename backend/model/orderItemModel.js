const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const OrderItem = sequelize.define("OrderItem", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Orders", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    product_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Products", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    batch_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Batches", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    line_total: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
  }, { timestamps: true });
  return OrderItem;
};