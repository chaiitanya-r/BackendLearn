import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Middleware to verify JWT and attach user to request object
export const verifyJWT = asyncHandler(async (req, _, next) => { //
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // Get the access token from the request

        if (!token) { // If no token is provided, throw an error
            throw new apiError("Unauthorized request", 401);
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // Verify the token using the secret key

        const user = await User.findById(decodedToken._id).select("-password -refreshToken") // Find the user by ID from the decoded token, excluding password and refresh token

        if (!user) { // If user does not exist, throw an error
            throw new apiError("Invalid token", 401);
        }
        req.user = user; // Attach the user to the request object
        next(); // Call the next middleware or route handler
    } catch (error) {
        throw new apiError(error?.message || "Invalid access token", 401);
    }
})