const express = require('express');
const requestRouter = express.Router();

const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

//Dynamic Request API for ignored and interested status
requestRouter.post("/request/send/:status/:toUserId",userAuth, async(req,res) => {

    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        //To check if the status is valid
        const allowedStatus = ["ignored","interested"];
        if(!allowedStatus.includes(status)){
            res.status(400).json({
                message: "Invalid status type: " + status,
            });
        }

        //To check if the toUser exists
        const toUser = await User.findById(toUserId);
        if(!toUser){
            res.status(400).json({message: "User not found"});
        }

        //Check if the connection request already exists between the two users
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId: fromUserId, toUserId: toUserId},
                {fromUserId: toUserId, toUserId: fromUserId},
            ],
        });

        if(existingConnectionRequest){
            res.status(400).json({
                message: "Connection request already exists",
            });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });

        const data = await connectionRequest.save();
        res.json({
            message: req.user.firstName + " is "+ status + " in " + toUser.firstName,
            data,
        });
    }

    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = requestRouter;