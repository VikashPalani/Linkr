const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

//Middleware to convert JSON data to JavaScript object
app.use(express.json());

//Connect to Database first before starting the server [IMPORTANT]

app.post("/signup" , async(req,res) => {

    //Creating a new INSTANCE of User model
    // const user = new User({
    //     firstName: "Thala",
    //     lastName: "Dhoni",
    //     emailId: "dhoni@gmail.com",
    //     password: "dhoni@123",
    // });

    //Creating a new INSTANCE of User model using req.body (All the data will be sent through API request)
    const user = new User(req.body);

    try{
        await user.save();
        res.send("User created successfully");
    } catch(err){
        console.error(err);
        res.status(400).send("Error occurred while creating user");
    }
});

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