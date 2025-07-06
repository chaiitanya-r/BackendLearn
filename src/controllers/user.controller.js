import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

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

export { registerUser };