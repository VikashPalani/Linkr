const express = require("express");
const authRouter = express.Router();

const {validateSignUpData} = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Signup API
authRouter.post("/signup" , async(req,res) => {

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

//Login API
authRouter.post("/login", async(req,res) => {
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
            res.send(user);
        }
        else{
            throw new Error("Invalid credentials");
        }
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

//Logout API
authRouter.post("/logout", async(req,res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("User logged out successfully");
})

module.exports = authRouter;