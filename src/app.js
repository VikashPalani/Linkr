const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

//API Examples for CRUD operations (Basic and important operations in any application) 

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

//Get user by emailId
app.get("/user", async(req,res) => {
    const userEmail = req.body.emailId;

    try{
        const users = await User.find({emailId: userEmail});
        if(users.length === 0){
            res.statusMessage(404).send("User not found");
        }
        else{
            res.send(users);
        }
    }
    catch(err){
        res.status(400).send("Error occurred while fetching user");
    }
});

//GET all the users from the database
app.get("/feed", async(req,res) => {
    try{
        //While passing an empty object to find() method, it will return all the documents from the collection
        const users = await User.find({});
        res.send(users);
    }
    catch(err){
        res.status(400).send("Error occurred while fetching users");
    }
});

//Delete user by userId
app.delete("/user", async(req,res) => {
    const userId = req.body.userId;
    try{
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted successfully");
    }
    catch(err){
        res.status(400).send("Error occurred while deleting user");
    }
});

//Update user by userId
app.patch("/user", async (req,res) => {
    const userId = req.body.userId;
    const updatedData = req.body;
    try{
        await User.findByIdAndUpdate({_id:userId}, updatedData);
        res.send("User updated successfully");
    }
    catch(err){
        res.status(400).send("Error occurred while updating user");
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