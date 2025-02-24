import mongoose from "mongoose";
const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, // Renamed from `song` to `name` for clarity
  thumbnail: {
    type: String,
    required: true,
  },
  songs: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Song",
      required: true,
    },
  ], // Reference Song model
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference User model
  collaborators: [
    {
      types: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.model("Playlist", playlistSchema);
