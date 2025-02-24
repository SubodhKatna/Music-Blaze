import express from "express";
import { register, login, logout, loginLimiter } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginLimiter, login); // 🔥 Apply brute-force protection middleware
router.post("/logout", logout);

export default router;
