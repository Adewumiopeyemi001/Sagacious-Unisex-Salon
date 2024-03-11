// const User = require('../models/user.models')

// const verifyOtp = async (email, otp) => {
//     try {
//         const user = await User.findOne({ email });

//         if (user && user.otp === otp) {
//             user.isVerified = true;
//             await user.save();
//             return true; // Return true if verification is successful
//         } else {
//             return false; // Return false if verification fails
//         }
//     } catch (err) {
//         console.error(err);
//         // throw new Error('Error verifying OTP');
//     }
// };

// module.exports = verifyOtp;
