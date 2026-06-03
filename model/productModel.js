const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("Product", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    unit: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_perishable: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reorder_threshold: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  }, { timestamps: true });
  return Product;
};