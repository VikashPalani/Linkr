const mongoose = require('mongoose');
const validator = require('validator');

// User Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid" + value);
            }
        },
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,

        //We can use Validate property to customize the validations for the fields
        // This will only run when we create a new document and not when we update the existing document unless we specify the runValidators option in API
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender is invalid");
            }
        },
    },
    skills: {
        type: [String],
    },
},
//This will create two fields in the document createdAt and updatedAt);
{timestamps: true}
);

// User Model | Here 'User' is the name of the model
module.exports = mongoose.model("User", userSchema);