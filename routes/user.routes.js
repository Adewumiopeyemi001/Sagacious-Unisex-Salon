const express = require('express');
const { signup, login, isOtpVerified, resendOtp, forgetPassword, resetPassword } = require('../controller/user.controller');
// const verifyOtp = require('../middlewares/verification');

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.post('/otpverify', isOtpVerified);
router.post('/resendotp', resendOtp);
router.post('/forgetpassword', forgetPassword);
router.post('/resetpassword', resetPassword);



module.exports = router;