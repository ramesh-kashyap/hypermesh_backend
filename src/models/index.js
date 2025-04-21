
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require('../config/connectDB');
const User = require('./User');
const Investment = require('./Investment');
const Withdraw = require('./Withdraw');
const Income = require('./Income');
const Graph = require('./Graph');

// const TelegramUser = require('./TelegramUser');

const Transaction = require('./Transaction');
const TelegramUser = require('./TelegramUser');
const UserTask = require('./UserTask');
const Task = require('./Task');
const WalletModel = require('./WalletModel');
const PasswordReset = require('./passwordReset');
const Activity = require('./Activity');
const Plan = require('./Plan');

// Define relationships
User.hasMany(Investment, { foreignKey: 'user_id_fk' });
Investment.belongsTo(User, { foreignKey: 'user_id_fk' });


User.hasMany(Graph, { foreignKey: 'user_id_fk' });
Graph.belongsTo(User, { foreignKey: 'user_id_fk' });

User.hasMany(Withdraw, { foreignKey: 'user_id_fk' });
Withdraw.belongsTo(User, { foreignKey: 'user_id_fk' });

User.hasMany(Income, { foreignKey: 'user_id_fk' });
Income.belongsTo(User, { foreignKey: 'user_id_fk' });
WalletModel.belongsTo(User, { foreignKey: 'user_id' });

Task.hasMany(UserTask, { foreignKey: "task_id", as: "userTasks" });
UserTask.belongsTo(Task, { foreignKey: "task_id", as: "task" });

// ✅ User Wallet Balance Model
const UserWalletModel = sequelize.define("WalletModel", {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    private_key: { type: DataTypes.TEXT, allowNull: false },
    wallet_address: { type: DataTypes.STRING, allowNull: false },
    blockchain: { type: DataTypes.ENUM("BSC", "TRON"), allowNull: false },
    balance: { type: DataTypes.DECIMAL(18, 6), allowNull: false, defaultValue: 0 }
}
    , {
        tableName: 'wallets',
        timestamps: false // No automatic created_at/updated_at
    }
);

// ✅ Gas Sponsorship Tracking
const GasSponsorshipModel = sequelize.define("GasSponsorship", {
    wallet_address: { type: DataTypes.STRING, allowNull: false },
    sponsored_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
    tableName: 'gassponsorships',
    timestamps: false // No automatic created_at/updated_at
}
);

// User.hasMany(TelegramUser, { foreignKey: 'user_id_fk' });
// TelegramUser.belongsTo(User, { foreignKey: 'user_id_fk' });



// User.hasMany(TelegramUser, { foreignKey: 'user_id_fk' });
// TelegramUser.belongsTo(User, { foreignKey: 'user_id_fk' });


// Sync models
sequelize.sync(); // Use { force: true } only if you want to recreate tables

module.exports = { sequelize, User, Investment, Withdraw, Income, WalletModel, UserWalletModel, GasSponsorshipModel, TelegramUser,Transaction,UserTask,Task,Graph,PasswordReset,Activity,Plan};

