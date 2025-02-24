import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: { 
    type: Date, 
    default: null 
  },
  likedSong: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Song",
    },
  ], // Array of song IDs
  likedPlaylist: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Playlist",
    },
  ], // Array of playlist IDs
  subscribedArtist: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ], // Array of user IDs
});

export default mongoose.model("User", UserSchema);
