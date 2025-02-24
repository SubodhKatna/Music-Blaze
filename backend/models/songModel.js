import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  song: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  trackUrl: {
    type: String,
    required: true,
  }, // More descriptive field name
  artist: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference User model
});

export default mongoose.model("Song", SongSchema);
