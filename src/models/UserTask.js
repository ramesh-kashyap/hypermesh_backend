const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB"); // Your Sequelize instance
const Task = require("./Task"); // Import Task model

const UserTask = sequelize.define("UserTask", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  telegram_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  bonus: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "completed"),
    defaultValue: "pending",
  },
});


module.exports = UserTask;