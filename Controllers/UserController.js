const UserModel=require('../Models/UserModel')
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
        const token=jwt.sign({EMailAddress:req.body.EMailAddress,name:user.name,id:user._id,profilePhotoUrl:req.body.profilePhotoUrl},process.env.JWT_SECRET_KEY,{expiresIn:JWT_EXPIRES_IN})
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
exports.getProfile=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let UID = new ObjectId(req.params.UID)
    try {
        let videos = []
        let user = await dB.collection("users").findOne({ _id: UID })
        console.log(user)
        videos = await dB.collection("videos").find().toArray()
        let _videos = videos.filter((video) => {
            return (video.createdBy == req.params.UID)
        })
        res.json({ success: true, user, videos: _videos, totalVideos: _videos.length })
    }
    catch (error) {
        res.json({ success: false })

    }

}
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
exports.follow=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let UID = new ObjectId(req.params.UID)
    let userToFollowID = new ObjectId(req.params.userToFollowID)
    let alreadyFollowing = false
    try {
        let user = await dB.collection("users").findOne({ _id: UID })
        let userToFollow = await dB.collection("users").findOne({ _id: userToFollowID })
        console.log(user)
        console.log(userToFollow)
        let followings = user.followings
        let followers = userToFollow.followers
        if (followings.length == 0) {

            let _followings = followings.concat({ name: userToFollow.name, EMailAddress: userToFollow.EMailAddress, ID: req.params.userToFollowID, bio: userToFollow.bio, profilePhotoUrl: userToFollow.profilePhotoUrl })
            await dB.collection("users").updateOne({ _id: UID }, { $set: { followings: _followings } })
            //({title:"Added A New Video",videoThumbnailUrl:req.body.thumbnailUrl,sentBy:req.params.UID, sentTo:follower.ID, videoID:video._id,userName:user.name,userProfilePhotoUrl:user.profilePhotoUrl})

            await dB.collection("notifications").insertOne({ title: "Started Following You", sentTo: userToFollow._id, sentBy: user._id, userName: user.name, userProfilePhotoUrl: user.profilePhotoUrl, addedOn: new Date().toLocaleDateString().split("T")[0], Type: "Followed" })
            let _followers = followers.concat({ name: user.name, EMailAddress: user.EMailAddress, ID: req.params.UID, bio: user.bio, profilePhotoUrl: user.profilePhotoUrl })
            await dB.collection("users").updateOne({ _id: userToFollowID }, { $set: { followers: _followers } })
        }
        else {
            for (let follower of followers) {
                if (follower.ID == req.params.UID) {
                    alreadyFollowing = true
                }

            }
            if (alreadyFollowing) {
                let _followings = followings.filter((viewer) => {
                    return (viewer.ID != req.params.userToFollowID)
                })
                await dB.collection("users").updateOne({ _id: UID }, { $set: { followings: _followings } })
                let _followers = followers.filter((viewer) => { return viewer.ID != req.params.UID })
                await dB.collection("notifications").insertOne({ title: "Has Unfollowed You", sentTo: userToFollow._id, sentBy: user._id, userName: user.name, userProfilePhotoUrl: user.profilePhotoUrl, addedOn: new Date().toLocaleDateString().split("T")[0], Type: "Unfollowed" })
                await dB.collection("users").updateOne({ _id: userToFollowID }, { $set: { followers: _followers } })
            }
            else {
                let _followings = followings.concat({ name: userToFollow.name, EMailAddress: userToFollow.EMailAddress, ID: req.params.userToFollowID, bio: userToFollow.bio, profilePhotoUrl: userToFollow.profilePhotoUrl })
                await dB.collection("users").updateOne({ _id: UID }, { $set: { followings: _followings } })
                await dB.collection("notifications").insertOne({ title: "Started Following You", sentTo: userToFollow._id, sentBy: user._id, userName: user.name, userProfilePhotoUrl: user.profilePhotoUrl, addedOn: new Date().toLocaleDateString().split("T")[0], Type: "Followed" })
                let _followers = followers.concat({ name: user.name, EMailAddress: user.EMailAddress, ID: req.params.UID, bio: user.bio, profilePhotoUrl: user.profilePhotoUrl })
                await dB.collection("users").updateOne({ _id: userToFollowID }, { $set: { followers: _followers } })
            }

        }
        res.json({ success: true })
    }
    catch (error) {
        res.json({ success: false })

    }
}