import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"; // bcrypt is used for hashing passwords
import jwt from "jsonwebtoken"; // jwt is used for generating tokens

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: {
        type: Schema.Types.ObjectId, // Reference to the Video model
        ref: "Video"
    },
    password: {
        type: String,
        required: [true, 'Password is Required']
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) { // Middleware to hash password before saving
    // If the password is not modified, skip hashing
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt round of 10
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) { // Method to compare the provided password with the hashed password
    // Use bcrypt to compare the plain text password with the hashed password
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () { // Method to generate an access token
    // Create a JWT token with user details and sign it with the access token secret
    return jwt.sign({ // Payload(data) of the token
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET, { // Secret key for signing the token
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Expiry time for the token
    })
}
userSchema.methods.generateRefreshToken = function () { // Method to generate a refresh token
    // Create a JWT token with user ID and sign it with the refresh token secret
    return jwt.sign({ // Payload(data) of the token
        _id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET, { // Secret key for signing the token
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Expiry time for the token
    })
}

export const User = mongoose.model("User", userSchema);