import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (email, userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in environment variables");
    }

    return jwt.sign(
        { email, id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Token valid for 7 days
    );
};

export default generateToken;
