const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");

//Middleware to convert JSON data to JavaScript object
app.use(express.json());

//Middleware to parse the cookies
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

//Connect to Database first before starting the server [IMPORTANT]
connectDB()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(7777, () => {
            console.log("Server is successfully listening on port 7777");
        });
    })
    .catch((err) => {
        console.error("Connection to database failed", err);
    });