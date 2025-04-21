const { User, Investment,Income,Plan} = require("../models"); // Adjust path as needed
const { Op } = require("sequelize"); // ✅ Import Sequelize Operators
const nodemailer = require("nodemailer");

// Get user's VIP level
async function getVip(userId) {
    try {
        const user = await User.findByPk(userId);
        if (!user) return 0;

        const levelTeam = await myLevelTeamCount(user.id);
        const genTeam = {};
        
        for (let i = 1; i <= 3; i++) {
            genTeam[i] = levelTeam[i] || [];
        }

        // Helper function to get active users with a minimum package
        async function countActiveUsers(team, packageAmount) {
            return await User.count({
                where: {
                    id: team,
                    active_status: "Active",
                    userbalance: { [Op.gte]: packageAmount }
                }
            });
        }

        const genTeamCounts = {};
        for (const amount of [100,500]) {
            genTeamCounts[amount] = {
                gen1: await countActiveUsers(genTeam[1], amount),
                gen2_3: await countActiveUsers(genTeam[2], amount) + await countActiveUsers(genTeam[3], amount)
            };
        }

        const userBalance = await getBalance(userId);
        let vipLevel = 0;
        if(userBalance>=100 && genTeamCounts[100].gen1 >= 1)
        {
             vipLevel = 1;
        }
        if (userBalance >= 500 && genTeamCounts[100].gen1 >= 3 && genTeamCounts[100].gen2_3 >= 5) {
            vipLevel = 2;
        }
        if (userBalance >= 1000 && genTeamCounts[100].gen1 >= 6 && genTeamCounts[100].gen2_3 >= 26) {
            vipLevel = 3;
        }
        if (userBalance >= 5000 && genTeamCounts[100].gen1 >= 15 && genTeamCounts[100].gen2_3 >= 100) {
            vipLevel = 4;
        }
        if (userBalance >= 20000 && genTeamCounts[100].gen1 >= 30 && genTeamCounts[100].gen2_3 >= 750) {
            vipLevel = 5;
        }
        if (userBalance >= 50000 && genTeamCounts[100].gen1 >= 50 && genTeamCounts[100].gen2_3 >= 2000) {
            vipLevel = 6;
        }

        return vipLevel;
    } catch (error) {
        console.error("Error in getVip:", error);
        return 0;
    }
}

// Get user's level team count (downline up to 'level' generations)
async function myLevelTeamCount(userId, level = 3) {
    try {
        let currentLevelUsers = [userId];
        let team = {};
        for (let i = 1; i <= level; i++) {
            const downline = await User.findAll({
                attributes: ["id"],
                where: { sponsor: currentLevelUsers }
            });

            if (downline.length === 0) break;
            currentLevelUsers = downline.map(user => user.id);
            team[i] = currentLevelUsers;
        }

        return team;
    } catch (error) {
        console.error("Error in myLevelTeamCount:", error);
        return {};
    }
}

// Get user's balance (active investments)
async function getBalance(userId) {
    try {
        const user = await User.findByPk(userId);
        return user.userbalance || 0;
    } catch (error) {
        console.error("Error in getBalance:", error);
        return 0;
    }
}

async function getPercentage(vipLevel) {
    try {
        let idx = (vipLevel==0)?1:vipLevel;
        const user = await Plan.findByPk(idx);
        return user.percentage || 0;
    } catch (error) {
        console.error("Error in getBalance:", error);
        return 0;
    }
}


async function sendEmail(email, subject, data) {
    try {
        // ✅ Create a transporter using cPanel SMTP
        const transporter = nodemailer.createTransport({
            host: "mail.hypermesh.io", // Replace with your cPanel SMTP host
            port: 465, // Use 465 for SSL, 587 for TLS
            secure: true, // true for 465, false for 587
            auth: {
                user: "info@hypermesh.io", // Your email
                pass: "Mayank036$", // Your email password
            },
        });
        const mailOptions = {
            from: '"HyperMesh" <info@hypermesh.io>', // Replace with your email
            to: email,
            subject: subject,
            html: `<p>Hi ${data.name},</p>
                   <p>We’re inform you that a One-Time Password (OTP) has been generated for your account authentication. Please use the OTP below to continue with your verification process.</p>
                   <p>OTP: ${data.code}</p>`,
        };
        // ✅ Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

async function addLevelIncome(userId, amount) {
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) return false;

        let userMid = user.id;
        let sponsorId;
        let cnt = 1;
        let baseAmount = amount / 100;
        const rname = user.username;
        const fullname = user.name;

        while (userMid && userMid !== 1) {
            const sponsorUser = await User.findOne({ where: { id: userMid } });
            if (!sponsorUser) break;
            sponsorId = sponsorUser.sponsor;
            let sponsorStatus = "Pending";
            let vipLevel = 0;

            if (sponsorId) {
                const sponsorDetails = await User.findOne({ where: { id: sponsorId } });
                if (sponsorDetails) {
                    sponsorStatus = sponsorDetails.active_status;
                    vipLevel = await getVip(sponsorDetails.id);
                }
            }

            // Define multipliers for different VIP levels
            const multipliers = {
                1: [7, 5, 1, 0 , 0],
                2: [8, 6, 2, 1 ,0],
                3: [10, 6, 2 ,1 , 1 ],
                4: [12, 8, 3, 2 , 1],
                5: [15, 8, 3, 2 , 1],
            };
            const currentMultipliers = multipliers[vipLevel] || [7, 5, 1, 0 , 0]; // Default to VIP 1 multipliers

            let commission = 0;
            if (sponsorStatus === "Active" && vipLevel >= 1) {
                if (cnt === 1) commission = baseAmount * currentMultipliers[0];
                if (cnt === 2) commission = baseAmount * currentMultipliers[1];
                if (cnt === 3) commission = baseAmount * currentMultipliers[2];
                if (cnt === 4) commission = baseAmount * currentMultipliers[3];
                if (cnt === 5) commission = baseAmount * currentMultipliers[4];
            }
            if (sponsorId && cnt <= 5 && commission > 0) {
                // Insert income record
                await Income.create({
                    user_id: sponsorId,
                    user_id_fk: sponsorUser.username,
                    amt: amount,
                    comm: commission,
                    remarks: "Level Income",
                    level: cnt,
                    rname,
                    fullname,
                    ttime: new Date(),
                });

                // Update user balance
                await User.update(
                    { userbalance: sponsorUser.userbalance + commission },
                    { where: { id: sponsorId } }
                );
            }

            userMid = sponsorId;
            cnt++;
        }

        return true;
    } catch (error) {
        console.error("Error in addLevelIncome:", error);
        return false;
    }
}


module.exports = { getVip, myLevelTeamCount, getBalance,getPercentage,addLevelIncome,sendEmail };