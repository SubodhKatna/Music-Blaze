import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";

dotenv.config();
const app = express();

// ✅ Connect to MongoDB with error handling
connectDB().catch(err => {
  console.error("Database connection failed:", err.message);
  process.exit(1); // Exit the process if the DB connection fails
});

// ✅ Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON data

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
