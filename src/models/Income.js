const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB");

const Income = sequelize.define(
  "Income",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id_fk: { type: DataTypes.INTEGER, allowNull: false },
    comm: { type: DataTypes.FLOAT, allowNull: false },
    remarks: { type: DataTypes.STRING, allowNull: true },
    amt: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    ttime: { type: DataTypes.DATE, allowNull: false },
    credit_type: { type: DataTypes.BIGINT, allowNull: false, defaultValue: "0" },
    level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    rname: { type: DataTypes.STRING, allowNull: true },
    fullname: { type: DataTypes.STRING, allowNull: true }
  },
  {
    tableName: "incomes",
    timestamps: false, // Set to true if you have createdAt/updatedAt columns
  }
);

module.exports = Income;
