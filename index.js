const express = require('express');
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectDB } = require('./config/db');
const mongoose = require("mongoose");
const router = require('./routes/user.routes');


const app = express();
app.use(express.json());
dotenv.config();
app.use(morgan("dev"));

const PORT = process.env.PORT || 3000;


app.get("/", (req, res) => {
    res.send("Welcome To SAGACIOUS UNISEX SALON");
});

app.use("/api/user", router);

app.get("*", (req, res) => {
    res.status(404).json("Page Not Found");
});

app.listen(PORT, async() => {
    try{
        await connectDB(process.env.MONGODB_UR);
        console.log("Database connection Established")
        console.log(`Server is listening on http://localhost:${PORT}`);

    }catch(error) {
        console.log("Error connecting to MongoDB: " + error.message);
    }
});
