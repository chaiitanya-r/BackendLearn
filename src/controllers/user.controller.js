import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => { // Define an asynchronous function to handle user registration
    // Here you would typically handle user registration logic, such as saving the user to a database
    res.status(200).json({ // Respond with a 200 status code and a JSON object
        success: true, // Indicate that the request was successful
        message: "ok" // Provide a message indicating success
    })
})

export { registerUser };