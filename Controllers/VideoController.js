const UserModel = require('../Models/UserModel')
const VideoModel=require('../Models/VideoModel')
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
const jwt = require("jsonwebtoken");

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
        if (!video.viewedBy.includes(req.user.id)) {
          video.viewedBy.push(req.user.id);
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

  
exports.getLikedVideos=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let videos = []
    try {
        let _hasLiked = false
        videos = await dB.collection("videos").find().toArray()
        let likedVideos = videos.filter((video) => {
            let hasLiked = false
            _hasLiked = hasLiked
            let likedBy = video.likedBy

            for (let viewer of likedBy) {
                if (viewer.ID == req.params.UID) {
                    hasLiked = true
                    _hasLiked = hasLiked
                }
            }
            return _hasLiked
        })

        res.json({ success: true, likedVideos, totalLikedVideos: likedVideos.length })
    }
    catch (error) {
        res.json({ success: false })
    }

}
exports.getSavedVideos=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let videos = []
    try {
        let _hasSaved = false
        videos = await dB.collection("videos").find().toArray()
        let savedVideos = videos.filter((video) => {
            let hasSaved = false
            _hasSaved = hasSaved
            let savedBy = video.savedBy

            for (let viewer of savedBy) {
                if (viewer.ID == req.params.UID) {
                    hasSaved = true
                    _hasSaved = hasSaved
                }
            }
            return _hasSaved
        })


        res.json({ success: true, savedVideos })
    }
    catch (error) {
        res.json({ success: false })
    }


}
exports.getWatchedVideos=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let videos = []
    try {
        videos = await dB.collection("videos").find().toArray()
        let _hasWatched = false
        let watchedVideos = videos.filter((video) => {
            let hasWatched = false
            _hasWatched = hasWatched
            let viewedBy = video.viewedBy
            for (let viewer of viewedBy) {
                if (viewer.ID == req.params.UID) {
                    hasWatched = true
                    _hasWatched = hasWatched
                }
            }
            return _hasWatched
        })

        res.json({ success: true, watchedVideos })
    }
    catch (error) {
        res.json({ success: false })
    }
}
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
      await video.save();
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

        // Save the updated video
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


exports.updateVideo=async(req,res)=>{
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let _ID = new ObjectId(req.params.ID)
    try
    {
        await dB.collection("videos").updateOne({_id:_ID},{$set:req.body})
        console.log("Video Updated Successfully!")
        res.json({success:true})
    }
    catch(e)
    {
        res.json({success:false})
    }
}
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
exports.deleteVideo=async(req,res)=>{
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let _ID  = new ObjectId(req.params.ID)
    try
    {
        await dB.collection("videos").deleteOne({_id:_ID})
        console.log("Video Deleted")
        res.json({success:true})
    }
    catch(e)
    {
        res.json({success:false})

    }

}
exports.deleteComment=async(req,res)=>{
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
  let _ID=  new ObjectId(req.params.ID)
    try
    {
     let video=   await dB.collection("videos").findOne({_id:_ID})
     let comments = video.comments
   let _comments=comments.filter((comment)=>{return (comment.ID!=req.params.commentID)})
   await dB.collection("videos").updateOne({_id:_ID},{$set:{comments:_comments}})
   res.json({success:true})
    }
    catch(e)
    {
        res.json({success:false})

    }

}
exports.saveVideo=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let alreadySaved = false
    let _UID = new ObjectId(req.params.UID)
    try {
        let _ID = new ObjectId(req.params.ID)
        let video = await dB.collection("videos").findOne({ _id: _ID })
        let savedBy = video.savedBy
        console.log(savedBy)
        console.log(video)
        if (savedBy.length == 0) {
            let user = await dB.collection("users").findOne({ _id: _UID })
            let _savedBy = savedBy.concat({ name: user.name, ID: user._id, EMailAddress: user.EMailAddress })
            dB.collection("videos").updateOne({ _id: _ID }, { $set: { savedBy: _savedBy } })
        }

        else {
            for (let viewer of savedBy) {
                if (viewer.ID == req.params.UID) {
                    alreadySaved = true
                }
            }
            if (alreadySaved == false) {
                let user = await dB.collection("users").findOne({ _id: _UID })
                let _savedBy = savedBy.concat({ name: user.name, ID: user._id, EMailAddress: user.EMailAddress })
                dB.collection("videos").updateOne({ _id: _ID }, { $set: { savedBy: _savedBy } })
            }
            else {
                let user = await dB.collection("users").findOne({ _id: _UID })
                let _savedBy = savedBy.filter((viewer) => {
                    return (viewer.ID != req.params.UID)
                })
                dB.collection("videos").updateOne({ _id: _ID }, { $set: { savedBy: _savedBy } })
            }
        }

        res.json({ success: true })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }

}