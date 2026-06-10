const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("Order", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    retailer_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Retailers", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    sales_rep_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    status: {
      type: Sequelize.ENUM("pending", "confirmed", "dispatched", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    total_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    order_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  }, { timestamps: true });
  return Order;
};