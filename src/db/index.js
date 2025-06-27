import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

const connectToDatabase = async () => { // Function to connect to MongoDB
    try { // Try to connect to MongoDB
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // Connect to MongoDB using the URI from environment variables and the database name
        console.log(`Connected to MongoDB at ${connectionInstance.connection.host}:${connectionInstance.connection.port}/${DB_NAME}`); // Log the connection details
    } catch (error) { // Catch any errors during the connection
        console.log('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if connection fails
    }
}

export default connectToDatabase; // Export the function to be used in other modules