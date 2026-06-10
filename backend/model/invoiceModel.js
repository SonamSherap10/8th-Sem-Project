const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Invoice = sequelize.define("Invoice", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Orders", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    invoice_number: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    total_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    due_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("unpaid", "partial", "paid"),
      allowNull: false,
      defaultValue: "unpaid",
    },
  }, { timestamps: true });
  return Invoice;
};