const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id_fk: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    remarks: { type: DataTypes.STRING, allowNull: true },
    ttime: { type: DataTypes.DATE, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: true },
    credit_type: { type: DataTypes.BIGINT, allowNull: false, defaultValue: "0" },
  },
  {
    tableName: "transactions",
    timestamps: false, // Set to true if you have createdAt/updatedAt columns
  }
);

module.exports = Transaction;
