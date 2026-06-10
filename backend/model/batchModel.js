const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Batch = sequelize.define("Batch", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Products", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    batch_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    quantity_received: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    quantity_remaining: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    expiry_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    received_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
  }, { timestamps: true });
  return Batch;
};