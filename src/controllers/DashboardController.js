const { User, Investment } = require("../models"); // Import User model
const { Income, Withdraw,sequelize,Transaction,TelegramUser ,PasswordReset} = require("../models");
const nodemailer = require("nodemailer");
const {  Op, fn, col } = require('sequelize'); // ✅ Import Sequelize Operators
const axios = require("axios");
const bcrypt = require("bcryptjs");
const { getVip } = require("../services/userService");



const sendCode = async (req, res) => {
    try {
        console.log("Received Email:sagar");

        const { email } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date(Date.now() + 10 * 60000); // 10-minute expiry

        console.log("Received Email:", email);

        // ✅ Check if user exists using Sequelize
        const user = await User.findOne({ where: { email } });
        console.log("Received Email:sagar",user.email);

        if (!user) {
            console.log("Email Not Found:", email);
            return res.status(404).json({ message: 'Email not found' });
        }

        console.log("User Found:", user.email);

        // ✅ Update verification code in database
        await User.update(
            { verification_code: code, code_expires_at: expiryTime },
            { where: { email: email } } // ✅ `where` condition added
        );
                console.log("Verification code updated in database");

        // ✅ Setup nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
                
            }
        });

        console.log("Nodemailer transporter configured");

        // ✅ Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Reset Code',
            text: `Your verification code is ${code}. This code will expire in 10 minutes.`
        };

        // ✅ Send email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully to:", email);

        return res.json({ message: 'Verification code sent successfully' });

    } catch (error) {
        console.error("Error in sendCode function:", error.message);
        return res.status(500).json({ error: error.message });
    }
};



const connectTelegram = async (req, res) => {
  
  try {
    const { telegram_id } = req.body;
    const user = req.user; // 🔹 Get authenticated user (Assuming JWT middleware is used   
    const id = user.id;
      if (!telegram_id) {
          return res.status(200).json({ message: "Telegram ID is required" });
      }
      
      const userExist = await User.findOne({ where: { telegram_id:telegram_id } });
      if (userExist) {
        return res.status(200).json({ message: "Telegram User exists",status:false });
      }

      if (user.telegram_id) 
        {
        return res.status(200).json({ message: "User Already Connected",status:false });
      }

      const telegramUser = await TelegramUser.findOne({ where: { telegram_id:telegram_id } });
      if (!telegramUser) {
        return res.status(200).json({ message: "Telegram User Not Found",status:false });
      }


            // Find and update if exists, otherwise insert a new record
            await User.upsert(
            { id, telegram_id:telegramUser.id }, // Ensure both `id` and `telegram_id` are provided
            { returning: true } // Ensures it returns the updated or created record
        );
      // Update TelegramUser's connected_time and is_connected fields
            await TelegramUser.update(
                {
                    connected_time: new Date(), // Set current timestamp
                    is_connected: 1 // Set as connected
                },
                {
                    where: { id: telegramUser.id } // Find by telegram_id
                }
            );


        return res.json({
            message:"Telegram Account Connected",
            user,
            status:true
        });

    } catch (error) {
        console.error("Database error:", error);
        return res.status(200).json({ message: "Internal Server Error", status:false });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { email, code, PSR } = req.body;
        const user = await User.findOne({
            where: {
                email
            }
        });

        const validCode = await PasswordReset.findOne({
            where: { token: code, email: user.email },
            attributes: ['email', 'token'] // Select only these columns
        });
        if (!validCode) {
            return res.status(400).json({ error: 'Invalid token' });
        }
       
       const hashedPassword = await bcrypt.hash(PSR, 10);
       

        await user.update({ PSR , password:hashedPassword});

        return res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error("Error in resetPassword function:", error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};




const verifyAccount = async (req, res) => {
    try {
        const {code} = req.body;
        const user =req.user ;

        const validCode = await PasswordReset.findOne({
            where: { token: code, email: user.email },
            attributes: ['email', 'token'] // Select only these columns
        });
        if (!validCode) {
            return res.status(400).json({ error: 'Invalid token' });
        }
       
        await user.update({ is_verify:1});
        return res.json({ success:true, message: 'account verified successfully' });

    } catch (error) {
        console.error("Error in verified function:", error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const user = req.user; 

        if (!user) {
            return res.status(404).json({ error: "User not found" , status: false});
        }

        const vipLevel = await getVip(user.id);
        

        return res.status(200).json({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            active_status: user.active_status,
            jdate: user.jdate,
            createdAt: user.createdAt,
            telegram_id: user.telegram_id,
            is_verify: user.is_verify,
            vip:vipLevel,
            status: true
            
        });
    } catch (error) {
        console.error("❌ Error fetching user details:", error);
        return res.status(500).json({ error: "Internal Server Error" ,   status: false});
    }
};


const getUsdtAddress = async (req, res) => {
    try {
        const user = req.user; 

        if (!user) {
            return res.status(404).json({ error: "User not found" , status: false});
        }

        return res.status(200).json({
            id: user.id,
            usdtTrc20: user.usdtTrc20,
            usdtBep20: user.usdtBep20,
            detail_changed_date: user.detail_changed_date,
            adate: user.adate,
            status: true
            
        });
    } catch (error) {
        console.error("❌ Error fetching user details:", error);
        return res.status(500).json({ error: "Internal Server Error" ,   status: false});
    }
};

const getAvailableBalance = async (req, res) => {
  try {
    const user = req.user; 
    const userId = user.id; // Authenticated User ID
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day
    // ✅ Users Income
        // console.log(totalIncome);

    const totalInvestment = await Investment.sum("amount", { where: { user_id: userId } });
    // ✅ Withdraw Amount
    const totalWithdraw = await Withdraw.sum("amount", { where: { user_id: userId } });
    // console.log(totalWithdraw);

    // ✅ Available Balance Calculation
    const balance = user.userbalance;

     const todayReward = user.todayroi;

    const totalReward = await Income.sum("comm", {
        where: {
            user_id: userId,
            remarks: "Node Reward",
        },
    });

   const todayCommission = await Income.sum('comm', {
          where: {
            user_id: userId,
            remarks: 'Team Commission',
            ttime: {
              [Op.gte]: today,
            },
          },
        });
        
        const totalCommission = await Income.sum('comm', {
          where: {
            user_id: userId,
            remarks: 'Team Commission',
          },
        });
    
    const totalReferral = await User.count({
      where: {
        sponsor: userId,
        active_status: "Active"
      }
    });

    const ids = await myLevelTeam(userId);
    const notes = await User.findAll({
        where: { id: ids.length ? { [Op.in]: ids } : null },
        order: [['id', 'DESC']]
    });

    const totalMember = notes.length;
    const totalValid = notes.filter(u => u.active_status === 'Active').length;
    const teamDesposit = notes.reduce((sum, user) => sum + (user.userbalance || 0), 0);;

    
    res.json({ available_balance: balance,withdraw:totalWithdraw,totlinvest:totalInvestment,todayReward,totalReward,todayCommission,totalCommission,totalReferral,totalMember,totalValid,teamDesposit });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getLast15DaysIncome = async (req, res) => {
    try {
      const user = req.user; 
      const userId = user.id; // Authenticated User ID
     
      const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 14); // 15 days including today

        const incomes = await Income.findAll({
            attributes: [
                [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
                [sequelize.fn("SUM", sequelize.col("comm")), "total_comm"]
            ],
            where: {
                user_id: userId,
                created_at: {
                    [Op.between]: [startDate, today]
                }
            },
            group: [sequelize.fn("DATE", sequelize.col("created_at"))],
            order: [[sequelize.fn("DATE", sequelize.col("created_at")), "DESC"]]
        });

         // Create a map of existing dates with income
         const incomeMap = new Map();
         incomes.forEach((record) => {
             incomeMap.set(record.dataValues.date, record.dataValues.total_comm);
         });
 
         // Generate last 15 days' data
         const result = [];
         for (let i = 0; i < 15; i++) {
             let date = new Date();
             date.setDate(today.getDate() - i);
             const formattedDate = date.toISOString().split("T")[0]; // Format YYYY-MM-DD
 
             result.push({
                 date: formattedDate,
                 total_comm: incomeMap.get(formattedDate) || 0, // Return 0 if no data for that date
             });
         }
 
      
      res.json({ success: true,result });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

const myLevelTeam = async (userId, level = 3) => {
    let arrin = [userId];
    let ret = {};
    let i = 1;
    
    while (arrin.length > 0) {
        const allDown = await User.findAll({
            attributes: ['id'],
            where: { sponsor: { [Op.in]: arrin } }
        });

        if (allDown.length > 0) {
            arrin = allDown.map(user => user.id);
            ret[i] = arrin;
            i++;
            if (i > level) break;
        } else {
            arrin = [];
        }
    }
    return Object.values(ret).flat();
};


const getTransactions = async (req, res) => {
    try {
      const user = req.user; 
      const userId = user.id; // Authenticated User I
      let { page = 1, limit = 10 } = req.query;

      
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        // Get total transaction count for the user
        const totalRecords = await Transaction.count({ where: { user_id:userId } });
        const totalPages = Math.ceil(totalRecords / limit);


      const transactions = await Transaction.findAll({
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
      console.error("Error fetching Transactions:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


  const liveRates = async (req, res) => {
    try {
      const symbols = ["BTCUSDT", "BNBUSDT"];
              const binanceResponses = await Promise.all(
                  symbols.map(symbol => axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`))
              );
      
              // Formatting the response
              const responseData = [
                  {
                      name: "USDT",
                      holdings: 1,
                      price: "$1.00",
                      total: "$1",
                      logo: "logo_usdt_2.svg",
                  },
                  {
                      name: "Bitcoin",
                      holdings: 0,
                      price: `$${parseFloat(binanceResponses[0].data.price).toLocaleString()}`,
                      total: `$${parseFloat(binanceResponses[0].data.price).toLocaleString()}`,
                      logo: "logo_btc_2.svg",
                  },
                  {
                      name: "BNB",
                      holdings: 0,
                      price: `$${parseFloat(binanceResponses[1].data.price).toLocaleString()}`,
                      total: `$${parseFloat(binanceResponses[1].data.price).toLocaleString()}`,
                      logo: "logo_bnb_2.svg",
                  }
              ];
              res.json({ success: true, responseData });
    } catch (error) {
      console.error("Error fetching Transactions:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };



  // API to get lastTrade time for a user
const getTelegramId = async (req, res) => {
    try {
        const { telegram_id } = req.body;
        if (!telegram_id) {
            return res.status(400).json({ success: false, message: "Telegram ID is required" });
        }

        // Fetch lastTrade time from the database
        const user = await TelegramUser.findOne({ where: { telegram_id } });

        return res.json({ success: true, user });

    } catch (error) {
        console.error("Error fetching getTelegramId:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


module.exports = { getUserDetails,sendCode,resetPassword,getAvailableBalance,connectTelegram,getLast15DaysIncome,getTransactions,liveRates,getTelegramId,getUsdtAddress,verifyAccount };
