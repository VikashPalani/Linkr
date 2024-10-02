const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {validateSignUpData} = require("./utils/validation");
const {userAuth} = require("./middlewares/auth");

//API Examples for CRUD operations (Basic and important operations in any application) 

//Middleware to convert JSON data to JavaScript object
app.use(express.json());

//Middleware to parse the cookies
app.use(cookieParser());

//Create a new user
app.post("/signup" , async(req,res) => {

    try{
        //Validation of data
        validateSignUpData(req);

        const {firstName, lastName, emailId, password} = req.body;

        //Encrypt the password before saving it to the database
        const passwordHash = await bcrypt.hash(password,10);

        //Creating a new INSTANCE of User model (All the data will be sent through API request)
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        await user.save();
        res.send("User created successfully");
    } 
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }

});

//Login user
app.post("/login", async(req,res) => {
    try{
        const {emailId,password} = req.body;
        //Write email validation here
        const user = await User.findOne({emailId: emailId});
        if(!user){
            throw new Error("Invalid credentials");
        }

        //returns true if the password is valid ( With the help of helper function in the userSchema)
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){
            //creates a JWT token with the help of the helper function in the userSchema
            const token = await user.getJWT();

            //Add the token to cookie and send the response back to the user
            res.cookie("token", token, {
                expires: new Date(Date.now() + 3600000),
            });
            res.send("User logged in successfully");
        }
        else{
            throw new Error("Invalid credentials");
        }
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
})

//Profile of the user
app.get("/profile", userAuth, async(req,res) => {
    try{
        //userAuth middleware will add the user object to the request object after validating the token for the user
        const user = req.user;
        res.send(user);
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
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
        const ALLOWED_UPDATES = ["userId","age","gender","password","skills"];

        //Checking if the user is trying to update any field other than the allowed fields
        const isUpdateAllowed = Object.keys(updatedData).every((update) => 
            ALLOWED_UPDATES.includes(update)
        );

        if(!isUpdateAllowed){
            throw new Error("Invalid updates");
        }

        if(updatedData?.skills.length > 10){
            throw new Error("Skills cannot be more than 10");
        }

        const user = await User.findByIdAndUpdate({_id:userId}, updatedData, {
            returnDocument: "after",
            //This will run the validations specified in the schema while updating the document
            runValidators: true,
        });
        res.send("User updated successfully");
    }
    catch(err){
        res.status(400).send("Updates failed" + err.message);
    }
});

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