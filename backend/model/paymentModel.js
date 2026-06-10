const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define("Payment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    retailer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Retailers", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    invoice_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Invoices", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    collected_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    method: {
      type: Sequelize.ENUM("cash", "bank_transfer", "cheque"),
      allowNull: false,
      defaultValue: "cash",
    },
    payment_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  }, { timestamps: true });
  return Payment;
};