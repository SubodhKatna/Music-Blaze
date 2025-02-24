import express from "express";
import passport from "passport";

const router = express.Router();

router.post("/create", passport.authenticate("user"), (req,res) => {
    
});