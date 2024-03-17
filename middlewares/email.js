const nodemailer = require("nodemailer");

const emailSender = async (email, userName, token) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });
    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to: email,
        subject: 'Welcome To SagaciousUnisexSalon',
        text: `Welcome ${userName} to SagaciousUnisexSalon
        You're highly welcomed. Your token to reset your password is ${token}. Please click http://localhost:4000/api/user/otpverify  and verify your otp`
    
      }
    
      await transporter.sendMail(mailOptions)
    };
    
    module.exports = emailSender;