import express from "express";
import passport from "passport";
import { createSong } from "../controllers/songController.js";

const router = express.Router();

router.post("/create", passport.authenticate("user"), createSong);

export default router;
