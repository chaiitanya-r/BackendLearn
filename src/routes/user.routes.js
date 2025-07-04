import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(registerUser); // Define a route for user registration that uses the registerUser controller

export default router;