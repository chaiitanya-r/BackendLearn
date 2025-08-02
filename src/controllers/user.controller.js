import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => { // Function to generate access and refresh tokens for a user
    // This function takes a userId, finds the user in the database, and generates tokens
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken(); // Generate access token for the user
        const refreshToken = user.generateRefreshToken(); // Generate refresh token for the user

        user.refreshToken = refreshToken; // Store the refresh token in the user document
        await user.save({ validateBeforeSave: false }); // Save the user document to the database

        return { accessToken, refreshToken }; // Return the generated tokens
    } catch (error) {
        throw new apiError("Something went wrong while generating access and refresh tokens", 500);
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Steps to register a user
    // 1. get user data from request body
    // 2. validate user data
    // 3. check if user already exists : e.g., by email, username
    // 4. check for images, check for avatar
    // 5. upload images to cloudinary
    // 6. create user in the database
    // 7. remove password and refresh token from response
    // 8. check for user creation
    // 9. return response with user data

    const { username, email, fullname, password } = req.body; // Extract user data from request body
    // console.log(req.body);
    // console.log("Registering user:", { username, email, fullname, password }); // Log the user data for debugging

    // validate user data
    if ([username, email, fullname, password].some((field) => field?.trim() === "")) { // Check if any field is empty
        throw new apiError("All fields are required", 400);
    }
    if (password.length < 8) { // Check if password is at least 8 characters long
        throw new apiError("Password must be at least 8 characters long", 400);
    }
    if (!email.includes("@")) { // Check if email contains '@'
        throw new apiError("Invalid email format", 400);
    }

    // check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
        throw new apiError("User already exists with this email or username", 409);
    }

    // console.log(req.files);

    // check for images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) { // Check if request is there and coverImage is an array with at least one file
        coverImageLocalPath = req.files.coverImage[0].path; // Get cover image local path if it exists
    }

    if (!avatarLocalPath) {
        throw new apiError("Avatar image is required", 400);
    }

    // upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath); // Upload avatar image to Cloudinary
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null; // Upload cover image to Cloudinary if it exists
    if (!avatar) { // Check if avatar upload was successful
        throw new apiError("Failed to upload avatar image", 500);
    }

    // create user in the database
    const user = await User.create({ // Create a new user in the database
        username: username.toLowerCase(), // Store username in lowercase
        email,
        fullname,
        password,
        avatar: avatar.url, // Store avatar URL
        coverImage: coverImage ? coverImage.url : null // Store cover image URL if it exists
    })

    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken"); // Fetch the created user without password and refresh token

    if (!createdUser) { // Check if user creation was successful
        throw new apiError("Failed to create user", 500); // Throw an error if user creation fails
    }

    // return response with user data
    return res.status(201).json( // Send a response with status 201 (Created)
        new apiResponse(200, createdUser, "User registered successfully") // Return a success response with the created user data
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // Steps to login a user
    // 1. get user data from request body
    // 2. validate user data
    // 3. check if user exists by email or username
    // 4. check if password is correct
    // 5. generate access token and refresh token
    // 6. send cookies with tokens

    const { email, username, password } = req.body; // Extract user data from request body

    if (!(email || username)) { // Check if either email or username is provided
        throw new apiError("Email or username is required", 400);
    }

    const user = await User.findOne({ // Check if user exists by email or username
        $or: [{ email }, { username }]
    })

    if (!user) { // If user does not exist, throw an error
        throw new apiError("User not found", 404);
    }

    const isPasswordValid = await user.isPasswordCorrect(password); // Check if the provided password is correct

    if (!isPasswordValid) { // If password is incorrect, throw an error
        throw new apiError("Invalid password", 401);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id) // Generate access and refresh tokens for the user

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // Fetch the logged-in user without password and refresh token

    const cookieOptions = { // Set cookie options for secure cookies
        httpOnly: true, // Cookie is not accessible via JavaScript
        secure: true, // Cookie is only sent over HTTPS
    }

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions) // Send access token as a cookie
        .cookie("refreshToken", refreshToken, cookieOptions) // Send refresh token as a cookie
        .json(new apiResponse(200, {
            user: loggedInUser, // Return the logged-in user data
            accessToken, // Include access token in the response
            refreshToken // Include refresh token in the response
        }, "User logged in successfully")) // Return a success response
})

const logoutUser = asyncHandler(async (req, res) => {
    // Steps to logout a user
    // 1. check if user is authenticated
    // 2. clear refresh token from user document
    // 3. clear cookies for access token and refresh token
    // 4. return success response

    await User.findByIdAndUpdate( // Update the user document to clear the refresh token
        req.user._id, // Use the user ID from the request object
        {
            $set: { refreshToken: undefined } // Clear the refresh token field
        }, { new: true } // options to return the updated document

    )
    const cookieOptions = { // Set cookie options for secure cookies
        httpOnly: true, // Cookie is not accessible via JavaScript
        secure: true, // Cookie is only sent over HTTPS
    }
    return res.status(200)
        .clearCookie("accessToken", cookieOptions) // Clear access token cookie
        .clearCookie("refreshToken", cookieOptions) // Clear refresh token cookie
        .json(new apiResponse(200, null, "User logged out successfully")) // Return a success response
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Steps to refresh access token
    // 1. check if refresh token is present in cookies
    // 2. verify the refresh token
    // 3. generate new access token
    // 4. return new access token

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // Get the refresh token from cookies or request body

    if (!incomingRefreshToken) {
        throw new apiError("Unauthorized access", 401);
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new apiError("Invalid refresh token", 401);
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new apiError("Refresh token is expired or invalid", 401);
        }

        const cookieOptions = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, cookieOptions) // Send new access token as a cookie
            .cookie("refreshToken", newRefreshToken, cookieOptions) // Send new refresh token as a cookie
            .json(new apiResponse(200, { accessToken }, "Access token refreshed successfully"))
    } catch (error) {
        throw new apiError(error?.message || "Invalid refresh token", 401);
    }
})

const changeCurrentPassword = asyncHandler(async (res, req) => {
    // Steps to change current password
    // 1. get current password, new password, confirm password from request body
    // 2. check if user is logged in
    // 3. check if current password is correct
    // 4. check if new password and confirm password match
    // 5. check if new password is at least 8 characters long
    // 6. update user password
    // 7. return success response

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new apiError('Current password is incorrect', 400)
    }

    if (newPassword !== confirmPassword) {
        throw new apiError('New password and confirm password do not match', 400)
    }

    if (newPassword.length < 8) {
        throw new apiError('New password must be at least 8 characters long', 400)
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new apiResponse(200, null, 'Password changed successfully'))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200)
        .json(new apiResponse(200, req.user, "User fetched successfully"))
})

const updateUserProfile = asyncHandler(async (req, res) => {
    // we will only let user to update their fullname, email

    // Steps to update user profile
    // 1. get fullname and email from request body
    // 2. check if fullname and email are provided
    // 3. update user document with new fullname and email
    // 4. return updated user data

    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new apiError("Fullname and email are required", 400);
    }

    const user = await UserfindByIdAndUpdate(req.user._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200)
        .json(new apiResponse(200, user, "User profile updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // Steps to update user avatar
    // 1. check if user is authenticated
    // 2. check if avatar file is provided
    // 3. upload avatar file to Cloudinary
    // 4. update user document with new avatar url
    // 5. return updated user data

    if (!req.user) {
        throw new apiError("Unauthorized access", 401);
    }

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError("Avatar file is missing", 400);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new apiError("Failed to upload avatar image", 500);
    }

    if (!avatar.url) {
        throw new apiError("Error while uploading avatar image to Cloudinary", 500);
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url
        }
    }, { new: true }).select("-password -refreshToken")

    return res.status(200)
        .json(new apiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // Steps to update user cover image
    // 1. check if user is authenticated
    // 2. check if cover image file is provided
    // 3. upload cover image file to Cloudinary
    // 4. update user document with new cover image url
    // 5. return updated user data

    if (!req.user) {
        throw new apiError("Unauthorized access", 401);
    }

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new apiError("Cover image file is missing", 400);
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new apiError("Failed to upload cover image", 500);
    }

    if (!coverImage.url) {
        throw new apiError("Error while uploading cover image to Cloudinary", 500);
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-password -refreshToken")

    return res.status(200)
        .json(new apiResponse(200, user, "Cover image updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfile,
    updateUserAvatar,
    updateUserCoverImage
};