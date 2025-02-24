import mongoose from "mongoose";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "./../models/userModel.js"; // Ensure the correct path to your User model
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const URL = process.env.MONGO_URI;
const URL_WITH_PASSWORD = URL.replace("<db_password>",process.env.MONGO_PASSWORD);
const FINAL_URL = URL_WITH_PASSWORD.replace("/?",`/${process.env.MONGO_NAME}?`);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(FINAL_URL, {});
    console.log("-----Database connected-----");
  } catch (error) {
    console.log("Failed to connect to database");
    console.error(`Error: ${error.message}`);
  }
};

// Passport JWT Strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || SBsijhfkjkhbjniuhweSIH,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findOne({ id: jwt_payload.sub });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

export default connectDB;
