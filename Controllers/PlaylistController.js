const PlaylistModel = require("../Models/PlaylistModel");

// Create a new playlist
exports.createPlaylist = async (req, res) => {
    console.log("Creating Playlists")
  try {
    const { title, description} = req.body;

    // Validate request body
    if (!title || typeof title !== "string") {
      return res.status(400).json({ success: false, message: "Playlist name is required and must be a string." });
    }
    if(!description)
    {
      return res.status(400).json({ success: false, message: "Playlist description is required" });


    }

    
    // Create the playlist
    const newPlaylist = new PlaylistModel({
      title,
      description: description || "",
      createdBy: req.user.id,
    });

    // Save to database
    await newPlaylist.save();

    // Respond with the created playlist
    res.status(201).json({
      success: true,
      message: "Playlist created successfully!",
      playlist: newPlaylist,
    });
  } catch (e) {
    console.error("Error creating playlist:", e.message);
    res.status(500).json({ success: false, message: "Failed to create playlist. Please try again." });
  }
};

// Get playlists created by the logged-in user
exports.getMyPlaylists = async (req, res) => {
  
  try {
    // Fetch playlists created by the user
    const playlists = await PlaylistModel.find({ createdBy: req.user.id });

    // Check if playlists exist
    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ success: true, message: "No playlists found." });
    }

    // Respond with the playlists
    res.status(200).json({
      success: true,
      message: "Playlists retrieved successfully.",
      playlists,
    });
  } catch (e) {
    console.error("Error fetching playlists:", e.message);
    res.status(500).json({ success: false, message: "Failed to fetch playlists. Please try again." });
  }
};
exports.addToPlaylist = async (req, res) => {
  try {
    const { playlistId, video } = req.body;

    // Validate the request
    if (!playlistId || !video || !video._id) {
      return res.status(400).json({
        success: false,
        message: "Playlist ID and video object with a valid '_id' are required.",
      });
    }

    // Find the playlist by ID
    const playlist = await PlaylistModel.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found.",
      });
    }

    // Check if the logged-in user owns the playlist
    if (playlist.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this playlist.",
      });
    }

    // Check if the video object already exists in the playlist
    const videoIndex = playlist.videos.findIndex(
      (v) => v._id.toString() === video._id.toString()
    );

    if (videoIndex > -1) {
      // Video object is already in the playlist, so remove it
      playlist.videos.splice(videoIndex, 1);
      await playlist.save();
      return res.status(200).json({
        success: true,
        message: "Video removed from the playlist.",
        playlist,
      });
    } else {
      // Video object is not in the playlist, so add it
      playlist.videos.push(video);
      await playlist.save();
      return res.status(200).json({
        success: true,
        message: "Video added to the playlist.",
        playlist,
      });
    }
  } catch (e) {
    console.error("Error in addToPlaylist:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to modify the playlist. Please try again.",
    });
  }
};
exports.getPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;

    const playlist = await PlaylistModel.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist retrieved successfully.",
      playlist,
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the playlist.",
    });
  }
};
exports.updatePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const { title, description } = req.body;
    console.log("Updating Playlist")

    const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
      playlistId,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!updatedPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist updated successfully.",
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the playlist.",
    });
  }
};
exports.deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;

    const deletedPlaylist = await PlaylistModel.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the playlist.",
    });
  }
};

