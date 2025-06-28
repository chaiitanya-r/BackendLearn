// A wrapper function to handle asynchronous operations in Express.js (PROMISES)
const asyncHandler = (requestHandler) => { // Function that takes a request handler as an argument

    (req, res, next) => { // Returns a new function that takes req, res, and next as parameters

        Promise.resolve(requestHandler(req, res, next)) // Wrap the request handler in a Promise to handle asynchronous operations
            .catch((err) => next(err)); // Execute the request handler and catch any errors
    }
}

export { asyncHandler }



// const asyncHandler = () => { }
// const asyncHandler = (func) => () => { }
// const asyncHandler = (func) => async () => { }

/* Wrapper function to handle asynchronous operations in Express.js (TRY-CATCH)

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next); // Execute the function passed to asyncHandler
        // The function should be an async function that takes req, res, and next as parameters
        // This allows the function to handle asynchronous operations, such as database queries or API calls
        // If the function executes successfully, it will proceed to the next middleware or route handler
        // If the function throws an error, it will be caught by the catch block
    } catch (error) {
        res.status(error.code || 500).json({ // Send a JSON response with the error status code or 500 if not specified
            success: false, // Indicate that the response is not successful
            message: error.message // Include the error message in the response
        })
    }
}
*/