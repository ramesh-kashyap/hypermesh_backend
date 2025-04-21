const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB"); // Import your Sequelize instance

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Add auto-increment if needed
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "tasks", // Explicitly define the table name
  timestamps: false,  // Disable createdAt & updatedAt columns
});


module.exports = Task;