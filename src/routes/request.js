const express = require('express');
const requestRouter = express.Router();

const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

//Dynamic Request API for ignore and interest status
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

//Dynamic Request API for accept and reject status
requestRouter.post("/request/review/:status/:requestId",userAuth, async(req,res) => {
    try{
        const loggedInUser = req.user;
        const status = req.params.status;
        const requestId = req.params.requestId;
        
        //To check if the status is valid
        const allowedStatus = ["accepted","rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message: "Invalid status type: " + status,
            })
        }

        //Check if the connection request is present in the database
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });
        if(!connectionRequest){
            return res.status(400).json({
                message: "Connection request not found",
            });
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.json({
            message: "Connection request has been " + status,
            data,
        });

    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
})

module.exports = requestRouter;