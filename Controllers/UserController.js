const UserModel=require('../Models/UserModel')
const PlaylistModel=require('../Models/PlaylistModel')
const VideoModel=require('../Models/VideoModel')
const jwt=require('jsonwebtoken')
const JWT_EXPIRES_IN='30d'

exports.createAccount=async (req, res) => {
    console.log("Req Body",req.body)

    try {
    let user=  await UserModel.findOne({EMailAddress:req.body.EMailAddress})
    console.log("User Found",user)
    if(user)
    {
        res.json({success:false,message:"AlreadyRegistered"})
    }
    

else
{
    let user=new UserModel(req.body)
    await user.save()
    const token=jwt.sign({EMailAddress:req.body.EMailAddress,name:user.name,id:user._id,profilePhotoUrl:req.body.profilePhotoUrl},process.env.JWT_SECRET_KEY,{expiresIn:JWT_EXPIRES_IN})
    res.json({success:true,token})
}
}
    catch (error) {
        console.log(error.message)
        res.json({ success: false ,message:"Failed!"})
    }
}
exports.updatedUser=async (req,res)=>{
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let _UID =new ObjectId(req.params.UID)
    try
    {
        await dB.collection("users").updateOne({_id:_UID},{$set:{name:req.body.name,EMailAddress:req.body.EMailAddress,bio:req.body.bio,passWord:req.body.passWord,profilePhotoUrl:req.body.profilePhotoUrl}})
        let user =  await dB.collection("users").findOne({_id:_UID})
        console.log(user)
        console.log("user Updated")
        res.json({success:true,user})
    }
    catch(e)
    {
        res.json({success:false})

    }
}
exports.login=async (req, res)=>{

    
    console.log(req.body.EMailAddress)
    console.log(req.body.passWord)
    try
    {
        let isRegistered=true
       let user=await UserModel.findOne({EMailAddress:req.body.EMailAddress})
        if(!user)
        {
           isRegistered=false 
        }
       
       if(isRegistered)
       {
       if(user.EMailAddress==req.body.EMailAddress&&user.passWord==req.body.passWord)
       {
        console.log("User Logged In")
        const token=jwt.sign({EMailAddress:req.body.EMailAddress,name:user.name,id:user._id,profilePhotoUrl:user.profilePhotoUrl},process.env.JWT_SECRET_KEY,{expiresIn:JWT_EXPIRES_IN})
       res.json({success:true,token})
       }
       else
       {
        res.json({success:false,message:"Incorrect Password"})
       }
       }
       else
       {
        res.json({success:false,message:"NotRegistered"})
       }
    }  
    catch(e)
{
    console.log("Error",e.message)
    res.json({success:false,message:"Failed"})

}
}
const mongoose = require("mongoose"); // Assuming Mongoose is being used

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Fetch user data
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch playlists created by the user
    const playlists = await PlaylistModel.find({ createdBy: userId });

    // Fetch videos created by the user
    const videos = await VideoModel.find({ uploadedBy: userId });

    // Send success response with user data, playlists, and videos
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
        user,
        playlists,
        videos,
      
    });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the profile.",
    });
  }
};

exports.getUser=async (req, res) => {
    await mongoose.connect("mongodb://127.0.0.1:27017/YouTube")
    const User = mongoose.model("users", UserSchema)
    let _UID = new ObjectId(req.params.UID)
    try {
        let user = await User.findById(_UID)
        res.json({ success: true, user })
    }
    catch (error) {
        res.json({ success: false })
    }
}


exports.follow = async (req, res) => {
    console.log("Follow API ")
    const  userId  = req.user.id; // Assuming authenticated user ID is available in req.user
    const { followingId } = req.body; // ID of the user to follow/unfollow

    if (!followingId) {
        return res.status(400).json({ success: false, message: "User ID to follow is required" });
    }

    try {
        // Fetch both users from the database
        const user = await UserModel.findById(userId);
        const userToFollow = await UserModel.findById(followingId);

        if (!user || !userToFollow) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the user is already following
        const isFollowing = user.followings.includes(followingId);

        if (isFollowing) {
            // Remove the following relationship
            user.followings = user.followings.filter(id => id.toString() !== followingId);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== userId);

            await user.save();
            await userToFollow.save();

            return res.status(200).json({ success: true, message: "Unfollowed the user successfully" });
        } else {
            // Add the following relationship
            user.followings.push(followingId);
            userToFollow.followers.push(userId);

            await user.save();
            await userToFollow.save();

            return res.status(200).json({ success: true, message: "Followed the user successfully" });
        }
    } catch (error) {
        console.error("Error in follow operation:", error);
        return res.status(500).json({ success: false, message: "An error occurred", error: error.message });
    }
};
const getAnalytics = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch all videos uploaded by the user
      const userVideos = await VideoModel.find({ uploadedBy: userId });
  
      // Calculate total views by summing up the lengths of viewedBy arrays
      const totalViews = userVideos.reduce((acc, video) => acc + video.viewedBy.length, 0);
  
      // Get the total number of videos
      const totalVideos = userVideos.length;
  
      // Find the most liked video
      const mostLikedVideo = userVideos.reduce((mostLiked, video) => {
        return video.likedBy.length > (mostLiked.likedBy?.length || 0) ? video : mostLiked;
      }, {});
  
      // Prepare data for "Most Watched Categories"
      const categoryViews = {};
      userVideos.forEach((video) => {
        categoryViews[video.category] = (categoryViews[video.category] || 0) + video.viewedBy.length;
      });
  
      const mostWatchedCategories = {
        labels: Object.keys(categoryViews),
        data: Object.values(categoryViews),
      };
  
      // Prepare "Recent Comments" (most recent 3 comments by date)
      const recentComments = userVideos
        .flatMap((video) =>
          video.comments.map((comment) => ({
            user: comment.userName,
            comment: comment.text,
            date: new Date(comment.date),
          }))
        )
        .sort((a, b) => b.date - a.date)
        .slice(0, 3)
        .map(({ user, comment }) => ({ user, comment }));
  
      // Prepare data for "Views Over Time" (monthly views)
      const viewsByMonth = {};
      userVideos.forEach((video) => {
        video.viewedBy.forEach((view) => {
          const month = new Date(view.date).toLocaleString("default", { month: "short" });
          viewsByMonth[month] = (viewsByMonth[month] || 0) + 1;
        });
      });
  
      const viewsOverTime = {
        labels: Object.keys(viewsByMonth),
        data: Object.values(viewsByMonth),
      };
  
      // Send response
      res.status(200).json({
        success: true,
        message: "Analytics data fetched successfully",
        data: {
          totalViews,
          totalVideos,
          mostLikedVideo: {
            title: mostLikedVideo.title || "No videos yet",
            likes: mostLikedVideo.likedBy?.length || 0,
          },
          viewsOverTime,
          mostWatchedCategories,
          recentComments,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching analytics data",
      });
    }
  };
  exports.getDashboardStatistics = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch user data
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      // Fetch videos uploaded by the user
      const videos = await VideoModel.find({ uploadedBy: userId });
  
      // Calculate total views from all videos
      const totalViews = videos.reduce((acc, video) => acc + video.viewedBy.length, 0);
  
      // Get recent uploads (uploaded in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUploads = videos.filter((video) => new Date(video.createdAt) > sevenDaysAgo);
  
      // Prepare statistics
      const statistics = {
        generalStats: [
          { title: "Total Subscribers", value: user.followers.length },
          { title: "Total Views", value: totalViews },
          { title: "Total Videos", value: videos.length },
        ],
        recentUploads: recentUploads.map((video) => ({
          id: video._id,
          title: video.title,
          createdAt: video.createdAt,
          views: video.viewedBy.length,
        })),
      };
      
  
      // Return response
      res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
    statistics,
      });
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching dashboard statistics",
        error: error.message,
      });
    }
  };
