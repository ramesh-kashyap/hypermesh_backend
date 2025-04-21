const Withdraw = require("../models/Withdraw");
const User = require("../models/User"); // User Model Import Karein
const Transaction = require("../models/Transaction"); // User Model Import Karein

const { PasswordReset } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const {sendEmail} = require("../services/userService");



const withdrawRequest = async (req, res) => {
    try {
        const { amount,method, address,code } = req.body;

        if (!amount || amount < 30) {
            return res.status(400).json({ error: "Invalid amount. Please enter a valid amount." });
        }
        const user = req.user; // Assuming middleware sets `req.user`
        const balance = parseFloat(user.userbalance.toFixed(2));
        let chargeAmt = 5;
        const validCode = await PasswordReset.findOne({
            where: { token: code, email: user.email },
            attributes: ['email', 'token'] // Select only these columns
        });
        if (!validCode) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        const payment_mode = method === "USDT BEP20" ? "USDT_BSC" : "USDT_TRX";
        const payment_colunm = method === "USDT BEP20" ? "usdtBep20" : "usdtTrc20";


        if (!payment_mode || typeof payment_mode !== "string") {
            return res.status(400).json({ error: "Invalid payment mode. Please select a valid network." });
        }

        if (!address.trim()) {
            return res.status(400).json({ error: "Please enter a valid withdrawal address." });
        }

        if (!req.user || !req.user.id || !req.user.username) {
            return res.status(401).json({ error: "User authentication failed. Please login again." });
        }
        const todayWithdraw = await Withdraw.findOne({
            where: { user_id: user.id, status: { [Op.ne]: 'Failed' }, wdate: moment().format('YYYY-MM-DD') }
        });
        if (todayWithdraw) {
            return res.status(400).json({ error: 'Withdrawal allowed once per day' });
        }

        const pendingWithdraw = await Withdraw.findOne({ where: { user_id: user.id, status: 'Pending' } });

        if (pendingWithdraw) {
            return res.status(400).json({ error: 'Withdraw request already exists' });
        }

        if (balance >= amount) {
            const withdrawData = {
                txn_id: require('crypto').randomBytes(16).toString('hex'),
                user_id: user.id,
                user_id_fk: user.username,
                amount,
                payable_amt: amount - (amount * chargeAmt / 100),
                charge: amount * chargeAmt / 100,
                account: address,
                payment_mode: payment_mode,
                status: 'Pending',
                wdate:new Date().toISOString().split("T")[0]
            };
            const withdrawal = await Withdraw.create(withdrawData);
             await Transaction.create({
                  user_id: user.id,
                  user_id_fk: user.username,
                  amount: amount,
                  remarks: "Withdraw",
                  credit_type: 0,
                  ttime: new Date(),
                  created_at:new Date(),
                });


            await User.update(
              {
                userbalance: parseFloat(balance) - parseFloat(amount),
                [payment_colunm]: address, // ← dynamic key here
              },
              {
                where: { id: user.id },
              }
            );
            return res.json({ success:true ,message: 'Withdrawal successful', withdrawId: withdrawal.id });
        } else {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
    } catch (error) {
        console.error("Withdraw request failed:", error);
        return res.status(500).json({ error: "Server error. Please try again later.", details: error.message });
    }
};

function verificationCode(length) {
    if (length <= 0) return 0;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



const sendCode = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

       const code = verificationCode(6);
       let emailId = user.email;
       await PasswordReset.destroy({ where: { email: emailId } });
        // ✅ Store new code
        await PasswordReset.create({
            email: emailId,
            token: code,
            created_at: new Date(),
        });
        const userIpInfo = { ip: req.ip || "Unknown" };
        await sendEmail(emailId, "Your One-Time Password", {
            ip: userIpInfo.ip,
            name: user.name,
            code: code,
            purpose: "Withdraw Request",
        });
    return res.json({ success: true, message: "OTP sent successfully" });
     } catch (error) {
        console.error("Send Code failed:", error);
        return res.status(500).json({ error: "Server error. Please try again later.", details: error.message });
    }
};



const getUserWithdraws = async (req, res) => {
    try {
        const user = req.user; 
        const userId = user.id; // Authenticated User I
        let { page = 1, limit = 10 } = req.query;
  
        
          page = parseInt(page);
          limit = parseInt(limit);
          const offset = (page - 1) * limit;
  
          // Get total transaction count for the user
          const totalRecords = await Withdraw.count({ where: { user_id:userId } });
          const totalPages = Math.ceil(totalRecords / limit);
  
  
        const transactions = await Withdraw.findAll({
          where: { user_id: userId },
          order: [["created_at", "DESC"]], // Order by latest transactions
          limit,
          offset,
      });
  
        res.json({ success: true,  transactions,
          totalPages,
          currentPage: page,
          totalRecords, });

    } catch (error) {
        console.error("Error fetching withdraws:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getWithdrawInfo = async (req, res) => {
    try {
        let { withdrawId } = req.query;  
        const withdrawInfo = await Withdraw.findOne({
          where: { id: withdrawId }
      });
     res.json({ success: true,withdrawInfo});

    } catch (error) {
        console.error("Error fetching withdraws:", error);
        res.status(404).json({ message: "Server error" });
    }
};


const getUserUsdtAddress = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("Fetched User Data:", user); 
  
      res.json({
        usdtTrc20: user.usdtTrc20 || "",
        usdtBep20: user.usdtBep20 || "",
      });
    } catch (error) {
      console.error("Error fetching user address:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
module.exports = { withdrawRequest,getUserWithdraws ,getUserUsdtAddress,sendCode,getWithdrawInfo};