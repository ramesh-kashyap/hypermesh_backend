const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB");

const Activity = sequelize.define(
  "Activity",
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      data: {
        type: DataTypes.TEXT('long'), // in case the callback data is large
        allowNull: false,
      }
  },
  {
    tableName: "activities",
    timestamps: false, // Set to true if you have createdAt/updatedAt columns
  }
);

module.exports = Activity;
