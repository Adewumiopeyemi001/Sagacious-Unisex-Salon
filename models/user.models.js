const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other',
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: String,

    },
    otpExpiration: {
        type: Date,
    },
    accountStatus: {
        type: String,
        enum: [ "inactive", "active"],
        default: "inactive",
    },
    isEmailVerify: {
        type: Boolean,
        default: false,
    },
},
{
    versionKey: false,
    timestamps: true,
});

const user = mongoose.model("user", userSchema);
module.exports = user;