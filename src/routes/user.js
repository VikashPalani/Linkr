const express = require("express");
const userRouter = express.Router();

const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = ["firstName", "lastName", "age", "gender", "about", "skills", "photoUrl"];

//Get all the pending connection requests for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async(req,res) => {
    
    try{
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
        toUserId: loggedInUser._id,
        status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA); //Populate the fromUserId with firstName and lastName

    res.json({
        message: "Data fetched successfully",
        data: connectionRequests,
    })
    }

    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

//Get all the connections for the loggedIn user
userRouter.get("/user/connections", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id, status: "accepted"},
                {toUserId: loggedInUser._id, status: "accepted"},
            ],
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return row.toUserId;
            }
            else{
                return row.fromUserId;
            }
        });

        res.json({
            message: "Data fetched successfully",
            data,
        });
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

//Get the feed for the loggedIn user
userRouter.get("/feed", userAuth, async(req,res) => {

    //LoggedIn User(HE) should see all the user cards except:
        //1. Himself
        //2. His connections
        //3. Users he already sent or recieved connection requests
        //4. Users whom he ignored or rejected

    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const skip = (page-1)*limit;

        //For hiding users from the feed (Includes all the four points mentioned above)
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id },
                {toUserId: loggedInUser._id}
            ],
        }).select("fromUserId toUserId");

        //We use Set data structure to store unique IDs
        const hideUsersFromFeed = new Set();
        connectionRequests.forEach(row => {
            hideUsersFromFeed.add(row.fromUserId.toString());
            hideUsersFromFeed.add(row.toUserId.toString());
        });

        //DB call to get all the users except the above users
        const users = await User.find({
            $and: [
                {_id: {$ne: loggedInUser._id}},
                {_id: {$nin: Array.from(hideUsersFromFeed)}},
            ],
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.send(users);
    }
    catch(err){
        res.status(400).json({message: err.message});
    }
});

module.exports = userRouter;