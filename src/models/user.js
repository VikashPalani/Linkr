const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    photoUrl: {
        type: String,
        default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fvectors%2Fblank-profile-picture-mystery-man-973460%2F&psig=AOvVaw1HtPgyZ6zVhweqgwwiiuG7&ust=1728400215938000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCKDRmdrG_IgDFQAAAAAdAAAAABAJ",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Photo URL is invalid");
            }
        },
    },
    about: {
        type: String,
        default: "Hey there! I am using Linkr",
    },
    skills: {
        type: [String],
    },
},
//This will create two fields in the document createdAt and updatedAt);
{timestamps: true}
);


//Schema Methods

//Helper method to get the JWT token for each user while logging in
userSchema.methods.getJWT = async function() {

    //"this" keyword will not work with arrow functions; So, we are using normal function here
    const user = this;
    const token = await jwt.sign(
        {_id: this._id}, "Linkr@9080",
        {expiresIn: "1d"}
    );

    return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const passwordHash = user.password;
    const isPasswordValid =  await bcrypt.compare(passwordInputByUser, passwordHash);

    return isPasswordValid;
}

// User Model | Here 'User' is the name of the model
module.exports = mongoose.model("User", userSchema);