class apiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode; // Assign status code to the instance
        this.data = data; // Assign data to the instance
        this.message = message; // Assign message to the instance
        this.success = statusCode < 400; // Set success to true if status code is less than 400
    }
}

export { apiResponse };