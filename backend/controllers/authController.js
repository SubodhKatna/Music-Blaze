import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// ✅ **Middleware: Rate Limit for Login Attempts**
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // ⛔ Allow only 5 attempts per IP
  handler: (req, res) => {
    return res.status(403).json({ message: "Too many login attempts, try again later." });
  },
});

// ✅ **Zod Validation Schema**
const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  userName: z.string().min(3),
});

// ✅ **Generate JWT Token with Expiry**
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // ⏳ Expires in 1 hour
};

// ✅ **Register New User**
export const register = async (req, res) => {
  try {
    registerSchema.parse(req.body);

    const { email, password, firstName, lastName, userName } = req.body;
    const normalizedEmail = email.toLowerCase(); // 🔥 Prevent duplicate case-sensitive emails

    // ✅ Check if email or username exists
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { userName }] });
    if (existingUser) {
      return res.status(409).json({ message: "Email or Username already in use" });
    }

    // ✅ Hash Password (12 rounds for security & performance)
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      userName,
      password: hashedPassword,
    });

    // ✅ Generate Token
    const authToken = generateToken(newUser._id);

    // ✅ Store token in HTTP-Only Secure Cookie
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(201).json({ message: "User registered successfully", authToken });
  } catch (err) {
    res.status(400).json({ message: "Invalid input", error: err.errors || err.message });
  }
};

// ✅ **Login User**
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    // ✅ If user not found
    if (!user) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    const currentTime = new Date();

    // ✅ Check if the account is locked and if the lock period is still active
    if (user.isLocked && user.lockedUntil && user.lockedUntil > currentTime) {
      const remainingLockTime = Math.ceil((user.lockedUntil - currentTime) / 1000); // In seconds
      return res.status(403).json({ 
        message: `Account is locked. Try again in ${remainingLockTime} seconds.`,
        remainingLockTime
      });
    }

    // ✅ Unlock account if lock period has expired
    if (user.isLocked && user.lockedUntil < currentTime) {
      user.isLocked = false;
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    // ✅ Handle incorrect password attempts
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      const remainingAttempts = 5 - user.failedLoginAttempts; // Calculate remaining attempts

      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await user.save();
        return res.status(403).json({ message: "Too many failed attempts. Account locked for 30 minutes." });
      }

      await user.save();
      return res.status(401).json({ 
        message: "Invalid credentials",
        remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
      });
    }

    // ✅ Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockedUntil = null;
    await user.save();

    const authToken = generateToken(user._id);

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Login successful", authToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};



// ✅ **Logout User**
export const logout = (req, res) => {
  res.cookie("authToken", "", { maxAge: 1 }); // ⏳ Clears token immediately
  res.status(200).json({ message: "Logged out successfully" });
};
