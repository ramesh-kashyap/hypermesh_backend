const { OAuth2Client } = require('google-auth-library');
const db = require("../config/connectDB");
const { User } = require('../models'); // Import User model


const jwt = require('jsonwebtoken');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateUsername = () => {
    const rand1 = Math.floor(Math.random() * 100); // Equivalent to `rand()` in PHP (last 2 digits)
    const timestamp = String(Date.now()).slice(-3); // Last 3 digits of `time()`
    const rand2 = Math.floor(Math.random() * 100); // Equivalent to `mt_rand()` in PHP (last 2 digits)

    return `${rand1}${timestamp}${rand2}`;
};



async function verifyGoogleToken(req, res) {
  try {
      const { token } = req.body;

      if (!token || typeof token !== "string") {
          throw new Error("Invalid token: Expected a non-empty string");
      }


      console.log(token);
      // Verify Google token
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      // Extract user details from Google payload
    //   console.log(payload.sub);
      
    
      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name || '';

      // Find or create the user in the database

      if (!User) {
        console.error("User model is undefined!");
        return res.status(500).json({ error: "Internal server error" });
    }

      let user = await User.findOne({ where: { google_id: googleId } });
      var d = new Date();
      const username = generateUsername();
      if (!user) {
          user = await User.create({
              google_id: googleId,
              email: email,
              name: name,
              username: username,
              jdate: d,
          });
      }

      // Generate JWT token
    //   console.log(user);
      const jwtToken = jwt.sign(
          {
              userId: user.id,
              googleId: user.google_id,
              email: user.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      console.log('JWT Token generated:', jwtToken);

      return res.status(201).json({ success: true, jwtToken });

  } catch (error) {
      console.error('Error verifying Google token:', error);
      return res.status(401).json({ success: false, error: 'Invalid Google token' });
  }
}

module.exports = { verifyGoogleToken };
  