const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDB');

const Withdraw = sequelize.define('Withdraw', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    charge: { type: DataTypes.FLOAT, allowNull: false },
    payable_amt: { type: DataTypes.FLOAT, allowNull: false },
    txn_id: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Approved', 'Pending', 'Rejected'), defaultValue: 'Pending' },
    payment_mode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    account: {
        type: DataTypes.STRING,
        allowNull: true,
    },
   
    wdate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'withdraws',
    timestamps: false
});

module.exports = Withdraw;