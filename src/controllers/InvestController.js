const { User, Investment, WalletModel,Activity,Transaction,Income } = require("../models"); // Import User model
const nodemailer = require("nodemailer");
const { Op } = require('sequelize');
const { ethers } = require("ethers");
const {TronWeb} = require("tronweb");
const axios = require("axios");
const logger = require("../../utils/logger");


const getHistory = async (req, res) => {
    try {
        const user = req.user;
        // console.log("Authenticated User:", user);

        if (!user || !user.id) {
            return res.status(400).json({ error: "User not authenticated" });
        }   
        const userId = user.id;
    
        const investmentHistory = await Investment.findAll({
            where: { user_id: userId, status:'Active'},
            order: [['created_at', 'DESC']] // Order by created_at in descending order
        });
        res.json({ success: true, data: investmentHistory });
    } catch (error) {
        console.error("Error fetching investment history:", error.message, error.stack);
        res.status(500).json({ error: error.message });
    }
};

const generateWallet = async (req, res) => {
    try {
        const user = req.user;
        const {blockchain} = req.body;
        // console.log("Authenticated User:", user);
        if (!user || !user.id) {
            return res.status(400).json({ error: "User not authenticated" });
        }   

        const refid = user.username;

        let wallet;
    

            if (blockchain === "BSC") {
              const apiResponse = await axios.get('https://api.cryptapi.io/bep20/usdt/create/?callback=https://api.hypermesh.io/api/auth/dynamic-upi-callback?refid='+refid+'&address=0x400c4C0A65FF457Ee3985eaA36887D5f37A002DC&pending=0&confirmations=1&email=hypermesh52@gmail.com&post=0&priority=default&multi_token=0&multi_chain=0&convert=0');
               if (apiResponse.data.status!="success") 
                {
                  return res.status(400).json({ error: "something went wrong" });
                }
                
                // logger.info('Incoming callback data: ' + apiResponse.data);
                logger.info('Incoming  data: ' + JSON.stringify(apiResponse.data));

                wallet = apiResponse.data.address_in;
            } else if (blockchain === "TRON") {
              const apiResponse = await axios.get('https://api.cryptapi.io/trc20/usdt/create/?callback=https://api.hypermesh.io/api/auth/dynamic-upi-callback?refid='+refid+'&address=TVcj37JgmEpMuN8BnXDSEWQyvvFbQ8b5L5&pending=0&confirmations=1&email=hypermesh52@gmail.com&post=0&priority=default&multi_token=0&multi_chain=0&convert=0');
              if (apiResponse.data.status!="success") 
               {
                 return res.status(400).json({ error: "something went wrong" });
               }
              wallet = apiResponse.data.address_in;

            }
      
     res.json({ message: "Wallet Assigned", wallet: wallet,blockchain:blockchain,status:true});
    } catch (error) {
        console.log("Error fetching investment history:", error.message, error.stack);
        res.status(500).json({ error: error.message,status:false });
    }
};


const dynamicUpiCallback = async (req, res) => {
  try {
    const response = JSON.stringify(req.query); // raw JSON
    const queryData = req.query;
   logger.info('Incoming callback data: ' + JSON.stringify(queryData));
    // Log the raw data
    await Activity.create({ data: response });
    if(
      (
        queryData.address_out === "0x400c4C0A65FF457Ee3985eaA36887D5f37A002DC" ||
        queryData.address_out === "TVcj37JgmEpMuN8BnXDSEWQyvvFbQ8b5L5"
      ) &&
      queryData.result === "sent" &&
      (
        queryData.coin === 'bep20_usdt' ||
        queryData.coin === 'trc20_usdt'
      )
    ){

      let txnId = queryData.txid_in; 
      const checkExits = await Investment.findOne({ where: { transaction_id:txnId } });
     let userName = queryData.refid;
      if (!checkExits) 
        {
            
             logger.info(`Processing new transaction: ${txnId} for user: ${userName}`);
        let amount = parseFloat(queryData.value_coin).toFixed(2);  
        let blockchain = queryData.coin === 'bep20_usdt' ? 'USDT_BSC': queryData.coin === 'trc20_usdt' ? 'USDT_TRON' : '';
   
        const user = await User.findOne({ where: { username:userName } });
        // insert investment

        const now = new Date();
        const invoice = Math.floor(1000000 + Math.random() * 9000000).toString();
        // Insert into database using Sequelize
        await Investment.create({
          plan: 1,
          orderId: invoice,
          transaction_id: txnId,
          user_id: user.id,
          user_id_fk: user.username,
          amount: amount,
          payment_mode: blockchain,
          status: "Active",
          sdate: now,
          active_from: user.username,
          created_at:now,
        });
    await Transaction.create({
          user_id: user.id,
          user_id_fk: user.username,
          amount: amount,
          remarks: "Deposit",
          credit_type: 1,
          ttime: now,
          created_at:now,
        });

       if (user) {
        const updatedData = {};
        const currentTime =new Date();

       const newBalance = parseFloat(user.userbalance) + parseFloat(amount);
       const newPackage = parseFloat(user.package) + parseFloat(amount);

        if (user.active_status === 'Pending') {
          updatedData.active_status = 'Active';
          updatedData.adate = currentTime;
          updatedData.package = amount;
          updatedData.userbalance = newBalance;
        } else {
          updatedData.active_status = 'Active';
          updatedData.package = newPackage;
          updatedData.userbalance = newBalance;
        }
     logger.info(`updatedData: ${updatedData} for user: ${userName}`);
        await User.update(updatedData, { where: { id: user.id } });
        
        
        
        
        // add sponsor Income 
        
         let sponsorUser = await User.findOne({ where: { id: user.sponsor }, order: [['id', 'DESC']] });
         
         if(sponsorUser && amount>=100)
         {
         let sp_status = sponsorUser.active_status;  
         let pp = 5;
          if(sp_status=="Active")
          {
          
             await Income.create({
              user_id: sponsorUser.id,
              user_id_fk: sponsorUser.username,
              amt: pp,
              comm: pp,
              remarks: "Direct Bonus",
              level: 1,
              rname:userName,
              fullname:user.name,
              ttime: now,
            });

        await Transaction.create({
            user_id: sponsorUser.id,
            user_id_fk: sponsorUser.username,
            amount: pp,
            remarks: "Direct Bonus",
            credit_type: 1,
            ttime: new Date().toISOString().split("T")[0],
          });
    
  
        await User.update(
          {
            userbalance: parseFloat(sponsorUser.userbalance) + parseFloat(pp),
          },
          { where: { id: sponsorUser.id } }
        );  
              
          }
             
         }
        
      }


   }


     }


     return res.status(200).json({
      message: "Callback processed",
      status: true
  });

  } catch (error) {
    console.log('UPI Callback Error:', error);
    logger.error('UPI Callback Error: ' + error.stack);
    return res.status(200).json({
      message: "Failed",
      status: false
  });

  }
};




async function getQrCode(data,amount,paymentMode) {
  const query = new URLSearchParams({
    address: data.address_in,
    value: amount,
    size: '512'
  }).toString();

  const url = `https://api.cryptapi.io/${paymentMode}/qrcode/?${query}`;

  try {
    const response = await axios.get(url);
    const result = response.data;
    return result;
  } catch (error) {
    console.error('Error fetching QR code:', error.response?.data || error.message);
    return null;
  }
}


// Confirm Deposit Function
const confirmDeposit = async (req, res) => {
    try {
      
      const user = req.user; // Authenticated user
      if (!user.email) {
        return res.status(400).json({ error: "Bind your email first from settings" });
      }
  
      const { amount, method } = req.body;
      const amountTotal = amount;
  
      // Determine Payment Mode
      let paymentMode = method === "USDT BEP20" ? "bep20/usdt" : "trc20/usdt";
      let wallet = method === "USDT BEP20" ? "0x400c4C0A65FF457Ee3985eaA36887D5f37A002DC" : "TVcj37JgmEpMuN8BnXDSEWQyvvFbQ8b5L5";
         logger.info('Wallet: ' + wallet);
  
      // Generate invoice number
      const invoice = Math.floor(1000000 + Math.random() * 9000000).toString();
      const refid = user.username;
      
      const response = await axios.get('https://api.cryptapi.io/'+paymentMode+'/create/?callback=https://api.hypermesh.io/api/auth/dynamic-upi-callback?refid='+refid+'&address='+wallet+'&pending=0&confirmations=1&email=rameshkashyap8801@gmail.com&post=0&priority=default&multi_token=0&multi_chain=0&convert=0');
      // console.log(response.data);
      

      if (response.data.status === "success") {
        const resultData = response.data;
       const qrCode = await getQrCode(resultData, amountTotal,paymentMode);


        return res.status(200).json({ success:true,
          walletAddress: resultData.address_in,
          method,
          qr_code: qrCode.qr_code,
          amount: amountTotal,
        });
      } else {
        return res.status(400).json({ error: response.data });
      }
    } catch (error) {

      return res.status(500).json({success:false, error: "Internal server error", details: error.message });
    }
  };
  

module.exports = { getHistory,generateWallet,confirmDeposit,dynamicUpiCallback};
