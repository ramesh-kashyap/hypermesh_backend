
const db = require("../config/connectDB");
const Income = require("../models/Income");




exports.getDirectIncome = async (req, res) => {
  try {
    console.log("Fetching all income data"); // ✅ Debugging

    // Fetch all income data using Sequelize
    const income = await Income.findAll();

    console.log("All Income Data:", income); // ✅ Debugging database result

    return res.status(200).json({ success: true, data: income });
  } catch (error) {
    console.error("Error fetching incomes:", error.message);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};


exports.getLevelIncome = async (req, res) => {
    try {
        const userId = req.user.userId; // ✅ Use correct field name
  
        if (!userId) {
            return res.status(400).json({ error: "User ID is missing from token" });
        }
  
        console.log("Fetching Level Income for User ID:", userId); // ✅ Debugging
  
        // Fetch Level Income from DB
        const [income] = await db.execute(
            "SELECT * FROM incomes WHERE user_id = ? AND remarks = 'Level Income'", 
            [userId]
        );
  
        console.log("Income Data:", income); // ✅ Debugging database result
  
        return res.status(200).json({ success: true, data: income });
    } catch (error) {
        console.error("Error fetching income:", error.message);
        return res.status(500).json({ error: "Server error", details: error.message });
    }
  };
  

  exports.getRoiIncome = async (req, res) => {
    try {
        const userId = req.user.userId; // ✅ Use correct field name
  
        if (!userId) {
            return res.status(400).json({ error: "User ID is missing from token" });
        }
  
        console.log("Fetching Roi Income for User ID:", userId); // ✅ Debugging
  
        // Fetch Level Income from DB
        const [income] = await db.execute(
            "SELECT * FROM incomes WHERE user_id = ? AND remarks = 'Roi Income'", 
            [userId]
        );
  
        console.log("Income Data:", income); // ✅ Debugging database result
  
        return res.status(200).json({ success: true, data: income });
    } catch (error) {
        console.error("Error fetching income:", error.message);
        return res.status(500).json({ error: "Server error", details: error.message });
    }
  };
