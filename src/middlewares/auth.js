const jwt = require("jsonwebtoken");
const User = require("../models/user");

//Read the token from req cookies
//Validate the token
//Find the user

const userAuth = async (req, res, next) => {
    try{
        const cookies = req.cookies;
        const {token} = cookies;

        if(!token){
            throw new Error("Invalid token");
        }

        //Validating the token, //Here the second parameter is the secret key used to create the token
        const decodeObj = await jwt.verify(token, "Linkr@9080");

        const { _id } = decodeObj;

        const user = await User.findById(_id);
        if(!user){
            throw new Error("User doesn't exist");
        }

        //Adding the user object to the request object
        req.user = user;
        next();
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
    
};

module.exports = {userAuth};