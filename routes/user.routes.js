const express = require('express');
const { signup, login, isOtpVerified } = require('../controller/user.controller');
// const verifyOtp = require('../middlewares/verification');

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.post('/otpverify', isOtpVerified);



module.exports = router;