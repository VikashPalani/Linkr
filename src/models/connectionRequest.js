const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        status: {
            type: String,
            // enum is used to restrict the values that a particular field can take
            enum: ["ignored", "interested", "accpeted", "rejected"],
            message: `{VALUE} is not a valid status`,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

//Compound indexing the fromUserId and toUserId for faster query
connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

//Schema Pre function (This is like a middleware which will run before the save operation)
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    //Check if the fromUserId and toUserId are same
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("FromUserId and ToUserId cannot be same");
    }
    //NEVER FORGET TO CALL NEXT() in the end, otherwise the save operation will not be completed
    next();
})

const connectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);

module.exports = connectionRequestModel;