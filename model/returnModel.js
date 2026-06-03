const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Return = sequelize.define("Return", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Orders", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
    reason: {
      type: Sequelize.ENUM("damaged", "expired", "wrong_product", "overstock"),
      allowNull: false,
    },
    warehouse_action: {
      type: Sequelize.ENUM("restocked", "written_off"),
      allowNull: true,
    },
    credit_note_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  }, { timestamps: true });
  return Return;
};