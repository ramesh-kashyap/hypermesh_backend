const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDB');

const Investment = sequelize.define('Investment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id_fk: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.STRING, allowNull: false },
    transaction_id: { type: DataTypes.STRING, allowNull: false },
    orderId: { type: DataTypes.STRING, allowNull: true },
    payment_mode: { type: DataTypes.STRING, allowNull: false },
    plan: { type: DataTypes.STRING, allowNull: true },
    active_from: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("Active", "Pending","Decline"), defaultValue: "Pending" },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    sdate: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'investments',
    timestamps: false // No automatic created_at/updated_at
});


module.exports = Investment;