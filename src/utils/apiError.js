// Handling API errors in a structured way
// This module defines a custom error class for API errors, which can be used to standardize

class apiError extends Error {
    constructor(
        message = "Something went wrong", // Default error message
        statusCode, // Default status code
        errors = [], // Default error array
        stack = "" // Default stack trace
    ) {
        super(message) // Call the parent constructor with the error message
        this.statusCode = statusCode // Assign status code to the instance
        this.message = message // Assign message to the instance
        this.data = null // Initialize data as null
        this.success = false // Set success to false
        this.errors = errors // Assign errors to the instance

        if (stack) {
            this.stack = stack // Assign stack trace if provided
        } else {
            Error.captureStackTrace(this, this.constructor) // Capture the stack trace if not provided
        }
    }
}

export { apiError }