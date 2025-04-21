const { DocDB } = require("aws-sdk");
const db = require("../config/connectDB");
const Graph = require("../models/Graph");
const User = require("../models/User"); // User Model Import Karein
const jwt = require('jsonwebtoken');




exports.getRoi = async (req, res) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        return res.status(400).json({ error: "User not authenticated" });
      }
// console.log(user);


      const userId = user.id;
      console.log("Fetching ROI data for user ID:", userId);
  
      const roiincome = await Graph.findAll({
        where: { user_id: userId },
      });
  
// console.log(roiincome);


      console.log("Fetched ROI Data:", roiincome);
      res.json({ success: true, data: roiincome });
    } catch (error) {
      console.error("Error fetching ROI data:", error.message, error.stack);
      res.status(500).json({ error: error.message });
    }
  };
  
  
// module.exports = { getRoi};