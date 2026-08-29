const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM("admin", "sales_rep", "warehouse", "delivery"),
      defaultValue: "sales_rep",
      allowNull: false,
    },
    region_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Regions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
  });
  return User;
};