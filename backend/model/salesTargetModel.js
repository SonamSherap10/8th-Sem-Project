const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const SalesTarget = sequelize.define("SalesTarget", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    target_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    month: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }, { timestamps: true });
  return SalesTarget;
};