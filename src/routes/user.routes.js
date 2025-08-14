import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    registerUser,
    updateUserAvatar,
    updateUserProfile
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

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

router.route('/refresh-token').post(refreshAccessToken)

router.route('change-password').post(verifyJWT, changeCurrentPassword)

router.route('/current-user').get(verifyJWT, getCurrentUser)

route.route('/update-account').patch(verifyJWT, updateUserProfile)

router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserAvatar)

router.routes('/c/:username').get(verifyJWT, getUserChannelProfile)

router.route('/history').get(verifyJWT, getWatchHistory)

export default router;