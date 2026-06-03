const { Sequelize } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
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
      allowNull: false,
    },
    region_id: {
      type: Sequelize.UUID,
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
      defaultValue: true,
    },
  }, {
    timestamps: true,
  });
  return User;
};