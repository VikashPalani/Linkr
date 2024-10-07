const express = require('express');
const profileRouter = express.Router();

const {userAuth} = require("../middlewares/auth");
const {validateEditProfileData} = require("../utils/validation");

//Profile of the user
profileRouter.get("/profile/view", userAuth, async(req,res) => {
    try{
        //userAuth middleware will add the user object to the request object after validating the token for the user
        const user = req.user;
        res.send(user);
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async(req,res) => {
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key]
        });
        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName}, your profile is updated successfully`,
            data: loggedInUser,
        });

    } 
    catch (err){
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = profileRouter;