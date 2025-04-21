const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDB');

const WalletModel = sequelize.define('Wallet', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    blockchain: { type: DataTypes.ENUM("BSC", "TRON"), allowNull: false, unique: true },
    wallet_address: { type: DataTypes.STRING, allowNull: false, unique: true },
    private_key: { type: DataTypes.TEXT, allowNull: false }
}, {
    tableName: 'wallets',
    timestamps: false
});

module.exports = WalletModel;