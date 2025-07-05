import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router;