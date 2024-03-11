const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
const User = require('./models/user.models');

dotenv.config();

mongoose.connect(process.env.MONGODB_UR);

const usersData = [
    {
        firstName: "Temitop",
        lastName: "Adeola",
        email: "Adeola223@yopmail.com",
        phoneNumber: "403405543",
        gender: "male",
        userName: "eiwissss22",
        password: "Adeolass222@"
    },
    {
        firstName: "adeolaww",
        lastName: "Titi2",
        email: "ajala2@yopmail.com",
        phoneNumber: "240405543",
        gender: "male",
        userName: "eiss222",
        password: "Adeolass2222@"
    },
    {
        firstName: "Mathewww",
        lastName: "Titiww",
        email: "alajaa@yopmail.com",
        phoneNumber: "403405543",
        gender: "female",
        userName: "tsiwss22",
        password: "Adeolawss222@"
    },
    {
        firstName: "Here",
        lastName: "Tid",
        email: "wwwss@yopmail.com",
        phoneNumber: "4330405543",
        gender: "male",
        userName: "eiwiq2",
        password: "Adessolass2222@"
    },
    {
        firstName: "kunle",
        lastName: "enery",
        email: "sjdssjs@yopmail.com",
        phoneNumber: "4ss0405543",
        gender: "male",
        userName: "eiwaaiss22",
        password: "Adeaaaolass222@"
    },
];
const seedUsers = async () => {
    try {
        for (const userData of usersData) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
            const newUser = new User(userData);
            await newUser.save();
        }
        console.log('Users seeded successfully');
    }catch (err) {
        console.error('Error seeding users:', err.message);
    }
    finally {
        mongoose.connection.close();
    }
};
seedUsers();