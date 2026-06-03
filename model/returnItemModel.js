const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const ReturnItem = sequelize.define("ReturnItem", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    return_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Returns", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    product_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Products", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    batch_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "Batches", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }, { timestamps: true });
  return ReturnItem;
};