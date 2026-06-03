const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Delivery = sequelize.define("Delivery", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: { model: "Orders", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    delivery_person_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    status: {
      type: Sequelize.ENUM("assigned", "in_transit", "delivered"),
      allowNull: false,
      defaultValue: "assigned",
    },
    dispatched_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  }, { timestamps: true });
  return Delivery;
};