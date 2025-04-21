const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectDB');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure unique usernames
    },
    sponsor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    active_status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Pending'), // Fixed ENUM options
        defaultValue: 'Pending', // Set default properly
        allowNull: false
    },
    jdate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Automatically set date
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true, // Ensure unique emails
        validate: {
            isEmail: true, // Ensure valid email format
        }
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true // Ensure Google ID is unique
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userbalance: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usdtTrc20: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usdtBep20: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    PSR: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    todayroi: { type: DataTypes.FLOAT, allowNull: true }, // Stores last trade timestamp
    total_reward: { type: DataTypes.FLOAT, allowNull: true }, // Stores last trade timestamp
    lastTrade: { type: DataTypes.DATE, allowNull: true }, 
  
   
    created_at: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    package: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    PSR: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    TPSR: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tpassword: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_verify: {
        type: DataTypes.INET,
        allowNull: true
    },
    ParentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    detail_changed_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    adate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: true
    },
    
    telegram_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true, // Ensuring telegram_id is unique
    },
    
  
}, {
    tableName: 'users',
    timestamps: false, // Enable createdAt and updatedAt fields
});




module.exports = User;