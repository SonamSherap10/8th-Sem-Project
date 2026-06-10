const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Region = sequelize.define("Region", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  }, { timestamps: true });
  return Region;
};