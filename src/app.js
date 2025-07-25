import express from 'express';
import cors from 'cors'; // Importing CORS for cross-origin resource sharing
import cookieParser from 'cookie-parser';

const app = express();

// Middleware configuration
// This middleware is used to handle CORS issues, parse JSON and URL-encoded bodies, and serve static files

app.use(cors({ // Configure CORS to allow requests from specific origins

    origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default or use the specified one
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}))

app.use(express.json({ // Parse JSON bodies

    limit: '16kb'// Set a limit for the JSON payload size
}))

app.use(express.urlencoded({ // Parse URL-encoded bodies

    extended: true, // Allow nested objects in URL-encoded data
    limit: '16kb' // Set a limit for the URL-encoded payload size
}))

app.use(express.static('public')) // Serve static files from the 'public' directory

app.use(cookieParser()) // Parse cookies from the request


// Importing routes
import userRouter from './routes/user.routes.js';

// Declaration of routes
app.use('/api/v1/users', userRouter) // Use the user router for all requests to /api/v1/users

// http://localhost:3000/api/v1/user/register

export { app as default };