const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const Region = sequelize.define("Region", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
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