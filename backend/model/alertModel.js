const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Alert = sequelize.define("Alert", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: Sequelize.ENUM("near_expiry", "low_stock", "overdue_payment"),
      allowNull: false,
    },
    reference_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    reference_type: {
      type: Sequelize.ENUM("batch", "product", "invoice"),
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    is_read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  }, { timestamps: true });
  return Alert;
};