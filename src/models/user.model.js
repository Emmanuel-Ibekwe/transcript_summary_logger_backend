const mongoose = require("mongoose")
const {Schema} = mongoose;
const validator = require('validator');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "name field is missing"]
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minLength: [8, "Password must be at least 8 characters long"],
            maxLength: [128, "Password must be at most 128 characters long"]
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, "Provide a valid email."]
        }
    },
    {
        collection: "users",
        timestamps: true
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;