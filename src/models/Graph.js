const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDB');

const Graph = sequelize.define(
  "Graph",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id_fk: { type: DataTypes.INTEGER, allowNull: false },
    day: { type: DataTypes.STRING, allowNull: true },
    roi: { type: DataTypes.INTEGER, allowNull: true },

  
  },
  {
    tableName: "graphs",
    timestamps: false, // Set to true if you have createdAt/updatedAt columns
  }
);

module.exports = Graph;
