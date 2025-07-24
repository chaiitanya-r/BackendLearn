import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([{
        name: 'avatar', // Field name for the avatar image
        maxCount: 1 // Limit to one avatar image
    }, {
        name: 'coverImage', // Field name for the cover image
        maxCount: 1 // Limit to one cover image
    }]),
    registerUser); // Define a route for user registration that uses the registerUser controller

router.route('/login').post(loginUser)

// Secured routes
router.route('/logout').post(verifyJWT, logoutUser) // Define a route for user logout that requires JWT verification

export default router;