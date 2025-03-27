const { default: mongoose } = require('mongoose');
const UserModel = require('../Models/UserModel')
const VideoModel=require('../Models/VideoModel')
const{IO,getReceiverSocketId, getIO}=require('../io')
const jwt=require('jsonwebtoken')
const NotificationModel=require('../Models/NotificationModel')
const PlaylistModel=require('../Models/PlaylistModel')
const getSortCriteria = (type) => {
  switch (type) {
    case 'high': return -1; // Descending
    case 'low': return 1; // Ascending
    case 'low to high': return 1;
    case 'high to low': return -1;
    default: return null;
  }
};
exports.getAllVideos=async (req, res) => {
    console.log("Getting All Videos")
    
    try{
        let videos=await VideoModel.find()
        res.json({success:true,videos})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }
   

}


exports.getVideo = async (req, res) => {
  console.log("Getting Single Video", req.query.token);


  try {
    // Fetch the video by ID
    const video = await VideoModel.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found!" });
    }

    // Fetch the uploader details
    const uploadedBy = await UserModel.findById(video.uploadedBy);
    if (!uploadedBy) {
      return res.status(404).json({ success: false, message: "Uploader not found!" });
    }

    // Handle token validation and decoding
    if (req.query.token) {
      try {
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Attach decoded user to the request object

        // Update the viewedBy array if the user is valid
        if (!video.viewedBy.some(view => view.id === req.user.id)) {
          video.viewedBy.push({
            id: req.user.id, // Add the user ID
            viewedAt: new Date(), // Add the current date and time
          });
          await video.save();
        }
        
      } catch (tokenError) {
        console.error("Invalid or expired token:", tokenError.message);
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
      }
    }

    // Fetch relevant videos (example logic: videos uploaded by the same user or similar category)
    const relevantVideos = await VideoModel.find({
      _id: { $ne: video._id }, // Exclude the current video
      category: video.category, // Match videos in the same category
    }).limit(5); // Limit the number of relevant videos

    // Send the response
    res.status(200).json({
      success: true,
      video,
      uploadedBy,
      relevantVideos,
    });
  } catch (error) {
    console.error("Error fetching video:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

  

exports.getLikedVideos = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate if userId exists
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch liked videos.",
      });
    }

    // Find videos liked by the user
    const likedVideos = await VideoModel.find({ likedBy: userId });

   

    // Return the liked videos
    res.status(200).json({
      success: true,
      message: "Liked videos fetched successfully.",
      likedVideos,
    });
  } catch (error) {
    console.error("Error in getLikedVideos:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching liked videos. Please try again later.",
    });
  }
};

exports.getSavedVideos = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate if userId exists
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch saved videos.",
      });
    }

    // Find all playlists created by the user
    const userPlaylists = await PlaylistModel.find({ createdBy: userId });

    if (userPlaylists.length === 0) {
      return res.status(404).json({
        success: true,
        message: "You have no saved videos as no playlists were found.",
        savedVideos: [],
      });
    }

    // Collect unique video IDs from the user's playlists
    const videoIds = new Set();
    userPlaylists.forEach((playlist) => {
      playlist.videos.forEach((video) => videoIds.add(video._id.toString()));
    });

    // Fetch video details from the VideoModel
    const savedVideos = await VideoModel.find({ _id: { $in: Array.from(videoIds) } });

   

    // Return the saved videos
    res.status(200).json({
      success: true,
      message: "Saved videos fetched successfully.",
      savedVideos,
    });
  } catch (error) {
    console.error("Error in getSavedVideos:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching saved videos. Please try again later.",
    });
  }
};

exports.getWatchedVideos = async (req, res) => {
  try {
    const userId = req.user.id; // Extract the user ID from the request object

    // Find all videos where the user has viewed them
    const watchedVideos = await VideoModel.find({
      "viewedBy.id": userId,
    })
    return res.status(200).json({
      success: true,
      message: "Watched videos retrieved successfully.",
      watchedVideos
    });
  } catch (e) {
    console.error("Error retrieving watched videos:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving watched videos.",
    });
  }
};

exports.deleteWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Extract the user ID from the request object

    // Update all videos to remove the user from the 'viewedBy' array
    const result = await VideoModel.updateMany(
      { "viewedBy.id": userId }, // Filter: Videos where the user exists in 'viewedBy'
      { $pull: { viewedBy: { id: userId } } } // Remove the user object from 'viewedBy'
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No watch history found for the user.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Watch history deleted successfully.",
    });
  } catch (e) {
    console.error("Error deleting watch history:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting watch history.",
    });
  }
};

exports.addVideo=async (req, res) => {
   console.log("Req Body",req.user)
   if(req.user)
    {

    
    try {
        req.body.uploadedByName=req.user.name
        req.body.uploadedByProfilePhotoUrl=req.user.profilePhotoUrl
        req.body.uploadedBy=req.user.id
        console.log("Uploaded By Photo",req.body.uploadedByProfilePhotoUrl)

        const video=new VideoModel(req.body)
       await  video.save()
        return res.json({ success: true })
    }
    catch (error) {
        return res.json({ success: false,message:error.message})
    }
}
else{
    res.json({success:false,message:"Unathorized User!"})
}

}


exports.likeVideo = async (req, res) => {
  try {
    const userId = req.user.id; // ID of the person liking the video
    const { videoId } = req.body; // ID of the video being liked

    // Find the video by ID
    const video = await VideoModel.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if the user has already liked the video
    const userHasLiked = video.likedBy.includes(userId);

    if (userHasLiked) {
      // If already liked, remove the user from the likedBy list
      video.likedBy = video.likedBy.filter(id => id.toString() !== userId.toString());
      await video.save();
      return res.status(200).json({success:true, message: "You have unliked the video", likedBy: video.likedBy });
    } else {
      // If not liked, add the user to the likedBy list
      video.likedBy.push(userId);
      const socketID=getReceiverSocketId(video.uploadedBy)
      const notification=new NotificationModel({sentByName:req.user.name,sentByPhotoUrl:req.user.profilePhotoUrl,title:`${req.user.name} Has Liked Your Video:`+video.title,type:"Liked Video", sentBy:req.user.id,sentTo:video.uploadedBy,videoId:video._id})
            getIO().to(socketID).emit("new-notification",notification)
    
            await video.save();
            await notification.save()
      return res.status(200).json({success:true, message: "You have liked the video", likedBy: video.likedBy });
    }
  } catch (error) {
    console.error("Error liking/unliking video:", error);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};


exports.addComment = async (req, res) => {
    try {
    
        // Destructure the required data from request
        const { videoId, comment } = req.body;
        const { id: userId, name, profilePhotoUrl } = req.user;

        // Validate the input
        if (!videoId || !comment) {
            return res.status(400).json({
                success: false,
                message: "Video ID and comment text are required.",
            });
        }

        // Fetch the video from the database
        const video = await VideoModel.findById(videoId);

        // If video is not found
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found.",
            });
        }

        // Create a new comment object
        const newComment = {
            _id:Math.random(),
            userId,
            name,
            profilePhotoUrl,
            text: comment,
            date: new Date(),
            replies:[]
        };

        // Add the comment to the video's comments array
        video.comments.push(newComment);
        const notification= new NotificationModel({sentByName:name,sentByPhotoUrl:profilePhotoUrl,type:"Added Comment",title:`${name} Commented Your Video:`+video.title,sentBy:userId,sentTo:video.uploadedBy,videoId:video._id})
       const socketId=getReceiverSocketId(video.uploadedBy)
       console.log("Socket ID",socketId)
      
        getIO().to(socketId).emit("new-notification",notification)

        // Save the updated video
       await notification.save()
        await video.save();

        // Respond with success
        return res.status(200).json({
            success: true,
            message: "Comment added successfully.",
            video, // Optionally return the updated comments
        });
    } catch (e) {
        // Handle any errors
        console.error("Error adding comment:", e);
        return res.status(500).json({
            success: false,
            message: "An error occurred while adding the comment.",
        });
    }
};
exports.replyToComment = async (req, res) => {
  console.log("Replying To Comment", req.body);
  try {
    const { videoId, commentId, replyText } = req.body;

    if (!videoId || typeof commentId === "undefined" || !replyText) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Find the video by ID
    const video = await VideoModel.findById(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }
     let comment = video.comments.find((c) => c._id.toString() === commentId.toString());

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }


    // Find the comment index by commentId
    const commentIndex = video.comments.findIndex((c) => c._id.toString() === commentId.toString());
    console.log("Comment Index",commentIndex)

    

    // Create a reply object
    const newReply = {
      _id: Math.random(), // Unique ID for the reply
      text: replyText,
      name: req.user.name,
      profilePhotoUrl: req.user.profilePhotoUrl,
      date: new Date(),
    };
    console.log("Comment Replies",comment.replies)
    comment.replies.push(newReply)
    console.log("Comment Replies After Updating",comment.replies)
    console.log("Latest Comment",comment)
    video.comments[commentIndex]=comment


    // Save the updated video
    await video.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully.",
      video,
    });
  } catch (e) {
    console.error("Error replying to comment:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while replying to the comment.",
    });
  }
};
exports.getSearchResults = async (req, res) => {
  console.log("Search Query", req.body);
  
  try {
    const { query = "", filters = {}, tab = 0, page = 1, limit = 5 } = req.body;
    const skip = (page - 1) * limit;
    let results = [];
    let totalCount = 0;

    if (tab === 0) {
      console.log("Getting Results For Video");

      // Video Search - Create base search query
      const searchQuery = query 
        ? { title: { $regex: query, $options: "i" } }
        : {};
      
      // Build filter criteria
      const filterCriteria = {};
      if (filters.date) {
        const now = new Date();
        if (filters.date === "24 hours") {
          filterCriteria.createdAt = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
        } else if (filters.date === "7 days") {
          filterCriteria.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
        } else if (filters.date === "30 days") {
          filterCriteria.createdAt = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
        } else if (filters.date === "all time") {
          // No filter for createdAt to include all documents
          delete filterCriteria.createdAt;
        }
      }
      
      // Combine search query and filters
      const matchStage = {
        $match: {
          ...searchQuery,
          ...filterCriteria,
        },
      };
      
      // Sorting criteria
      const sortCriteria = {};
      if (filters.views) sortCriteria.viewsCount = getSortCriteria(filters.views); // Sort by views first
      if (filters.likes) sortCriteria.likesCount = getSortCriteria(filters.likes); // Then by likes
      
      // Default sort if no specific criteria
      if (Object.keys(sortCriteria).length === 0) {
        sortCriteria.createdAt = -1; // Default to descending creation date
      }
      
      console.log("Match Stage:", matchStage);
      console.log("Sort Criteria:", sortCriteria);
      
      try {
        // First get total count with matching criteria
        totalCount = await VideoModel.countDocuments({
          ...searchQuery,
          ...filterCriteria,
        });
      
        // Then perform aggregation with all stages
        results = await VideoModel.aggregate([
          matchStage, // Apply search and filters first
          {
            $addFields: {
              likesCount: { $size: "$likedBy" },
              viewsCount: { $size: "$viewedBy" },
            },
          },
          {
            $sort: sortCriteria, // Apply sorting by views and likes
          },
          { $skip: skip },
          { $limit: limit },
        ]);
      
      } catch (error) {
        console.error("Error in fetching video results:", error);
        throw error;
      }
      
    } else if (tab === 1) {
      // People Search
const searchQuery = query ? { name: { $regex: query.trim(), $options: "i" } } : {};
console.log("Search Query:", searchQuery);

// Sorting criteria
const sortCriteria = {};
if (filters.subscribers) {
  sortCriteria.followersCount = getSortCriteria(filters.subscribers); // 1 for ascending, -1 for descending
}
console.log("Sort Criteria:", sortCriteria);

  // Get total count
  totalCount = await UserModel.countDocuments(searchQuery);

  // Perform aggregation for people search
  results = await UserModel.aggregate([
    { $match: searchQuery }, // Match users based on search query
    {
      $addFields: {
        followersCount: { $size: "$followers" }, // Add a calculated field for followers count
      },
    },
    {
      $sort: Object.keys(sortCriteria).length > 0
        ? sortCriteria // Use the provided sorting criteria
        : { followersCount: -1 }, // Default to descending by followers count
    },
    { $skip: skip }, // Pagination: skip records
    { $limit: limit }, // Pagination: limit records
  ]);

  


    }

   

    res.status(200).json({
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });

  } catch (error) {
    console.error("Error in /search:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getMyVideos = async (req, res) => {
  console.log("Get My Videos")
  try {
    
    const userId = req.user.id;

    // Fetch all videos uploaded by the user
    const videos = await VideoModel.find({ uploadedBy: userId });

    res.status(200).json({
      success: true,
      message: "Videos fetched successfully.",
      videos,
    });
  } catch (e) {
    console.error("Error fetching videos:", e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos.",
    });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    console.log("Deleting Video")
    const userId = req.user.id;
    const videoId = req.params.videoId;

    // Find the video by its ID
    const video = await VideoModel.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // Check if the user is the uploader of the video
    if (video.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this video.",
      });
    }

    // Delete the video
   await VideoModel.findByIdAndDelete(videoId)

    res.status(200).json({
      success: true,
      message: "Video deleted successfully.",
    });
  } catch (e) {
    console.error("Error deleting video:", e);
    res.status(500).json({
      success: false,
      message: "Failed to delete video.",
    });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.body.videoId;
    const updateData = req.body;

    // Find the video by its ID
    const video = await VideoModel.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // Check if the user is the uploader of the video
    if (video.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this video.",
      });
    }

    // Update the video
    Object.assign(video, updateData); // Merge the update data into the video document
    await video.save();

    res.status(200).json({
      success: true,
      message: "Video updated successfully.",
      video,
    });
  } catch (e) {
    console.error("Error updating video:", e);
    res.status(500).json({
      success: false,
      message: "Failed to update video.",
    });
  }
};

exports.getVideoDetail=async(req,res)=>{
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let _ID  = new ObjectId(req.params.ID)
    try
    {
     let video= await dB.collection("videos").findOne({_id:_ID})
     console.log("Video Fetched!")
     res.json({success:true,video})
    }
    catch(e)
    {
        res.json({success:false})

    }
}
