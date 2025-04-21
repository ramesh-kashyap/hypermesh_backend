const express = require('express');
let router = express.Router();

const AuthController = require("../controllers/AuthController");
const IncomeController = require("../controllers/incomeController");
const TelegramController = require("../controllers/TelegramController");
const DashboardController = require("../controllers/DashboardController");
const authMiddleware = require("../middleware/authMiddleware"); // JWT Auth Middleware
const telegramAuthMiddleware = require("../middleware/telegramAuthMiddleware"); // JWT Auth Middleware
const passport = require('passport');
const googleController = require('../controllers/googleController');
const teamController = require('../controllers/teamController');
const InvestController = require('../controllers/InvestController');
const GraphController = require('../controllers/GraphController');
const ChromeController = require('../controllers/ChromeController');
const { getVip } = require("../services/userService");
const  withdrawController  = require('../controllers/withdrawController');




router.post('/google', googleController.verifyGoogleToken);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);


router.get("/direct-income", authMiddleware, IncomeController.getDirectIncome);
router.get("/level-income", authMiddleware, IncomeController.getLevelIncome);
router.get("/Roi-income", authMiddleware, IncomeController.getRoiIncome);
router.post("/team", authMiddleware ,teamController.getTeam);
router.get('/list', authMiddleware, teamController.listUsers);
router.get("/userinfo", authMiddleware, DashboardController.getUserDetails);
router.get("/get-chart-data", authMiddleware, DashboardController.getLast15DaysIncome);
router.get("/getTransactions", authMiddleware, DashboardController.getTransactions);
router.get("/liveRates", authMiddleware, DashboardController.liveRates);
router.post("/getTelegramId", authMiddleware, DashboardController.getTelegramId);
router.get("/usdt-address", authMiddleware, DashboardController.getUsdtAddress);
router.get('/profile', authMiddleware, AuthController.getUserProfile);
router.post('/verified-email', AuthController.checkForgotEmail);
router.post('/resetPassword', AuthController.resetPassword);


router.put('/Update-Profile', authMiddleware, AuthController.updateUserProfile);
router.post('/send-code', DashboardController.sendCode);
router.post('/reset-password',  DashboardController.resetPassword);
router.get("/available-balance", authMiddleware, DashboardController.getAvailableBalance);
router.post("/connect-telegram", authMiddleware, DashboardController.connectTelegram);
router.post("/verify-account", authMiddleware, DashboardController.verifyAccount);

router.get("/deposit-History", authMiddleware, InvestController.getHistory);
router.post("/recharge", authMiddleware, InvestController.confirmDeposit);
router.get("/telegram-history", authMiddleware, TelegramController.getTelegramHistory);
router.post("/generate-wallet", authMiddleware, InvestController.generateWallet);
router.get("/dynamic-upi-callback", InvestController.dynamicUpiCallback);


router.get("/roi", authMiddleware, GraphController.getRoi);
// withdraw
router.post("/withdrawal",authMiddleware,withdrawController.withdrawRequest)
router.get("/sendCode",authMiddleware,withdrawController.sendCode)
router.get("/sendCodeForget",AuthController.sendCodeForget)
router.get("/sendCodeSignUp",AuthController.sendCodeSignUp)

router.get("/withdraws",authMiddleware,withdrawController.getUserWithdraws)
router.get("/getWithdrawInfo",authMiddleware,withdrawController.getWithdrawInfo)
router.post('/start-e-trade', authMiddleware,ChromeController.startTrade);
router.post('/claim-e-reward',authMiddleware, ChromeController.claimReward);
router.post('/update-e-today-roi',authMiddleware, ChromeController.updateTodayRoi);
router.post('/get-e-last-trade',authMiddleware,  ChromeController.getLastTrade);

router.get('/get-e-mining-bonus',authMiddleware, ChromeController.getMiningBonus);





// telegram api 
router.post('/telegram-login', AuthController.loginWithTelegram);
router.post('/telegram-user-detail', TelegramController.getUserByTelegramId);
router.post('/start-trade', telegramAuthMiddleware,TelegramController.startTrade);

router.post('/get-last-trade',telegramAuthMiddleware, TelegramController.getLastTrade);
router.post('/claim-reward',telegramAuthMiddleware, TelegramController.claimReward);
router.get('/fetch-points',telegramAuthMiddleware, TelegramController.fetchPoints);
router.post('/update-today-roi',telegramAuthMiddleware, TelegramController.updateTodayRoi);
router.get('/get-mining-bonus',telegramAuthMiddleware, TelegramController.getMiningBonus);
router.post('/getTasks',telegramAuthMiddleware, TelegramController.getTasks);
router.get('/get-user-balance',telegramAuthMiddleware, TelegramController.getUserBalance);
router.post('/startTask',telegramAuthMiddleware, TelegramController.startTask);
router.post('/claimTask',telegramAuthMiddleware, TelegramController.claimTask);
router.get('/getReferral',telegramAuthMiddleware, TelegramController.getReferral);



router.get("/vip/:userId", async (req, res) => {
  const { userId } = req.params;
  const vipLevel = await getVip(userId);
  res.json({ userId, vipLevel });
});



// Mount the router on /api/auth so that /register becomes /api/auth/register
const initWebRouter = (app) => {
    app.use('/api/auth', router);
  };

  module.exports = initWebRouter;
