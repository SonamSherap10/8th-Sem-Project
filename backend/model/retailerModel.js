const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Retailer = sequelize.define("Retailer", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    contact_person: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    region_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Regions", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    credit_limit: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    current_balance: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  }, { timestamps: true });
  return Retailer;
};