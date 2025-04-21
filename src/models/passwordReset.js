const { DataTypes } = require("sequelize");
const sequelize = require('../config/connectDB');

const PasswordReset = sequelize.define(
  "PasswordReset",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
  },
  {
    tableName: "password_resets",
    timestamps: false, // Laravel doesn't use updatedAt for this table
  }
);

module.exports = PasswordReset;