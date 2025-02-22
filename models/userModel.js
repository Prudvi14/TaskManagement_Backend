const mongoose = require("mongoose"); 

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true, 
            required: true, 
        },
        password: {
            type: String,
            required: true,
        },
        //     type: {
        //         type: String,
        //         default: "client",
        //         enum: ["client", "user", "admin"],
        //     },
        // age: {
        //     type: Number,
        // },
        // age: Number,
    },
    {
        timestamps: true, // this automatically add the server time of document creation / updating
    }
);

const User = mongoose.model("users", userSchema); // collection name is upto you, but keep it noun and in plural form, this is the convention

module.exports = User;
// this User model will be used in future
// to create a user
// to search for a user
// to update a user
// to delete a user

// NOTE: it should imported in the required file
