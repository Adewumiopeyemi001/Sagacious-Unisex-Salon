
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const emailSender = require('../middlewares/email');
// const verifyOtp = require('../middlewares/verification');
const mongoose = require("mongoose");
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
        const { email, otp} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "Please kindly signup"});
        }

        // Check if OTP exists and if it's expired
        const userOtp = user.otp;
        const otpExpiration = user.otpExpiration;
        if (!userOtp || otpExpiration < new Date()) {
            return res.status(401).json({ message: "OTP expired or invalid" });
        }

        if(userOtp == otp) {
            user.isEmailVerify = true;
            user.accountStatus = "active"; 
            await user.save();
        return res.status(200).json({message: "Account Verified Successfully"});  
        } else {
            return res.status(401).json({message: "Invalid OTP"});
        }
              
        
    }catch (err) {
        res.status(500).json({message: "Error verifiying account", err});
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
