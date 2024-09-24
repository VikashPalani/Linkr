const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
    },
    password: {
        type: String,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
    }
});

// User Model | Here 'User' is the name of the model
module.exports = mongoose.model("User", userSchema);