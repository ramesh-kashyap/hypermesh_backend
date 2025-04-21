const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDB');

const Plan = sequelize.define(
  "Plan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rank: { type: DataTypes.INTEGER, allowNull: false },
    percentage: { type: DataTypes.FLOAT, allowNull: true },

  
  },
  {
    tableName: "plans",
    timestamps: false, // Set to true if you have createdAt/updatedAt columns
  }
);

module.exports = Plan;
