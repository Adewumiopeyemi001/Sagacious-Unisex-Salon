const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const emailSender = require('../middlewares/email');
// const mongoose = require("mongoose");
const User = require('../models/user.models');
const { OTP_EXPIRATION_TIME } = require("../config/constants");

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, gender, userName, password } = req.body;
        if (!firstName || !lastName || !email || !phoneNumber || !gender || !userName || !password) {
            return res.status(404).json({ message: "Please fill all the required information" });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please log in." });
        }

        const generateOTP = () => {
            const digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            return OTP;
        };

        const otp = generateOTP();
        const otpExpiration = new Date();
        otpExpiration.setMinutes(otpExpiration.getMinutes() + OTP_EXPIRATION_TIME); // Set expiration time

        // Save OTP and its expiration time in the user document
        

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            phoneNumber,
            email,
            gender,
            userName,
            otp,
            password: hashedPassword,
            otpExpiration,
        });
        await newUser.save();
        await emailSender(email, userName, otp);
        res.status(201).json({message: "Details received, please check your email to verify your account"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving user" });
    }
};
exports.isOtpVerified = async (req, res) => {
    try{
        const otp = req.query.otp;
        if (!otp) {
            return res.status(400).json({message: "User Not Found"});
        }
        const user = await User.findOne({otp: otp});
        if (!user) {
            return res.status(400).json({message: "Account Not Found, Please kindly signup"});
        }

        if (user.otp != otp) {
            return res.status(400).json({message: "Invalid OTP"})
        }
        // Check if OTP exists and if it's expired
        const userOtp = user.otp;
        const otpExpiration = user.otpExpiration;
        if (!userOtp || otpExpiration < new Date()) {
            return res.status(401).json({ message: "OTP expired" });
        }

        if(userOtp == otp) {
            user.isEmailVerify = true;
            user.accountStatus = "active"; 
            user.otp = null,
            user.otpExpiration = null,
            await user.save();
        return res.status(200).json({message: "Account Verified Successfully"});  
        }     
        
    }catch (err) {
        res.status(500).json({message: "Error verifiying account", err});
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body; // Destructure email from the request body
        if (!email) {
            return res.status(400).json({ message: "User Not Found, Please Signup" });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // Check if previous OTP has expired
    const now = new Date();
    if (user.otpExpiration && user.otpExpiration > now) {
      return res.status(400).json({ message: "Previous OTP has not expired yet" });
    }

        // Generate a new OTP
        const generateOTP = () => {
            const digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            return OTP;
        };

        const newOtp = generateOTP();
        const newOtpExpiration = new Date();
        newOtpExpiration.setMinutes(newOtpExpiration.getMinutes() + OTP_EXPIRATION_TIME); // Set expiration time

        // Update user's OTP and its expiration time
        user.otp = newOtp;
        user.otpExpiration = newOtpExpiration;
        user.isEmailVerify = false;
        await user.save();

        // Send the new OTP via email
        await emailSender(email, user.userName, newOtp);

        return res.status(200).json({ message: "New OTP Sent Successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error Sending OTP" });
    }
};

exports.forgetPassword = async (req, res) => {
    try {
        const {emailOrUserName} = req.body;
        if (!emailOrUserName) {
            return res.status(400).json({message: "Email or Username does not exist"});
        }
        const user = await User.findOne({ $or: [{ email: emailOrUserName }, { userName: emailOrUserName }] });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }
        // Generate a unique token for password reset
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await emailSender(user.email, user.userName, token);
        return res.status(200).json({ message: "Token sent successfully" });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Error initiating password reset" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("Error resetting password:", err);
        return res.status(500).json({ message: "Error resetting password" });
    }
};



exports.login = async (req, res) => {
        
    try {
        const { emailOrUserName, password } = req.body;
        if (!emailOrUserName || !password) {
            return res.status(400).json({message: "Please input your Email or Username and Password"});
        }
        const user = await User.findOne({ $or: [{ email: emailOrUserName }, { userName: emailOrUserName }] });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        if (user.isEmailVerify != true) {
            return res.status(400).json({message: "User Not Verified, Please check your email"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect Password' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({message: "User Logged in Successfully", token: token, user});
    }catch (err) {
        return res.status(500).json({message: "Error Logging User", err});
    }
};
