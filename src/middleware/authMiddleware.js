const jwt = require("jsonwebtoken");
const {User} = require("../models");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"        
        // console.log(token);
        
        if (!token) {
            return res.status(200).json({ error: "Unauthorized: Token missing" , redirect: true });
        }
        // Token Verify Karna
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // User Fetch Karn
          let userId = Object.keys(decoded).includes("id")?decoded.id:decoded.userId;          
          const user = await User.findByPk(userId);        
        if (!user) {
            return res.status(200).json({ error: "Unauthorized: User not found", redirect: true });
        }
          req.user = user; // ✅ `req.user` me login user store karein
        
        next();
    } catch (error) {
        return res.status(200).json({ error: "Invalid token", details: error.message ,redirect: true });
    }
};

module.exports = authMiddleware;
