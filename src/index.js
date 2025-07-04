// Importing the necessary modules 

import dotenv from 'dotenv'; // Import dotenv to load environment variables
import mongoose from 'mongoose';
import connectToDatabase from './db/index.js'; // Import the database connection function
import app from './app.js';

dotenv.config({ path: './.env' }); // configure dotenv to load environment variables from .env file

connectToDatabase() // Call the function to connect to MongoDB


    .then(() => { // If connection is successful, start the Express server
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`); // Log the server port
        })
    })
    .catch((error => { // If connection fails, log the error
        console.error('Error connecting to MongoDB:', error); // Log the error if connection fails
        throw error; // Rethrow the error for further handling
    }))













/*
// 1st approach: directly connect to Database in the main file.

// Importing the necessary modules
import mongoose from 'mongoose';
import { DB_NAME } from './constants';
import express from 'express';
const app = express(); // Create an Express app

; (async () => { // Use async-await
    try { // Try to connect to MongoDB
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // Connect to MongoDB
        app.on('error', (err) => { // Handle errors in the Express app
            console.error('Express server error:', err);
            throw err;
        });
        app.listen(process.env.PORT, () => { // Start the Express server
            console.log(`Server is running on port ${process.env.PORT}`); // Log the server port
        })
    } catch (error) { // Catch any errors during the connection
        console.error('Error connecting to MongoDB:', error); // Log the error
        throw error;
    }
})() // Immediately invoked function expression (IIFE) to handle async-await
*/