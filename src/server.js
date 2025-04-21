require('dotenv').config();
const routes = require('./routes/web');
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const passport = require("passport");
const winston = require("winston");
const initWebRouter = require("./routes/web");
const cron = require("node-cron");
const AWS = require("aws-sdk");
const { Server } = require("socket.io");
const http = require("http");
const { User, WalletModel,UserWalletModel, GasSponsorshipModel, Investment,Graph } = require("./models");
const { ethers } = require("ethers");
const { TronWeb } = require("tronweb");
// Load bot token from .env file
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3002;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });



// Security Middleware
app.use(helmet());
const allowedOrigins = ["https://app.hypermesh.io", "https://miniapp.hypermesh.io"]; // Add multiple origins
app.use(
   cors({
      origin: function (origin, callback) {
         if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            callback(new Error("Not allowed by CORS"));
         }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
   })
);

app.use(express.json());

// 👇 Add this line right after creating the app
app.set('trust proxy', true);




// Apply CORS middleware for Express
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*", credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests from this IP' });
// app.use(limiter);

// Logger Configuration
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

// Session Setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Initialize Web Routes
// routes.initWebRouter(app);

// Default Route

app.get("/", (req, res) => {
    res.send({ message: "Secure Node.js API with MySQL" });
    
});


// const initWebRouter = (app) => {
//     app.use('/', router);  // Apply the router to the app, starting from the root
// };
initWebRouter(app);


// /start

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    // Welcome message
    const welcomeMessage =  `🚀 *Welcome to the HyperMesh Bot!*\n\n` +
    `Easily connect to the HyperMesh network, participate in our airdrop program, and start earning rewards.\n\n` +
    `💰 *Here's what you can do:*\n` +
    `🎉 Claim exclusive airdrops\n` +
    `🔗 Contribute node computing power\n` +
    `🏆 Complete tasks & earn rewards\n` +
    `🎯 Manage your HyperMesh Node effortlessly\n\n` +
    `🔥 *Start your journey with HyperMesh  today!*`;
    // Buttons with links
    const options = {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🚀 Start Mining", url: "https://t.me/hypermesh_bot/meshhyper" }],
                [{ text: "💬 Join Our Community", url: "https://t.me/MeshHyper" }],

            ]
        }
    };

    // Send image with caption and buttons
    bot.sendPhoto(chatId, "https://api.hypermesh.io/banner.png", { caption: welcomeMessage, ...options });
});






// ✅ **Cron Job to Auto-Transfer Funds Every 10 Minutes**
// cron.schedule("*/10 * * * *", async () => {
//     console.log("🔄 Running Auto-Transfer Job...");
//     await checkPendingPayments();
// });

// Start Server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
});
module.exports = initWebRouter;