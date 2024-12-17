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
exports.getVideo=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let alreadyViewed = false
    let _UID = new ObjectId(req.params.UID)
    try {
        let _ID = new ObjectId(req.params.ID)
        let video = await dB.collection("videos").findOne({ _id: _ID })
        let viewedBy = video.viewedBy
        console.log(viewedBy)
        console.log(video)
        if (viewedBy.length == 0) {
            let user = await dB.collection("users").findOne({ _id: _UID })
            let _viewedBy = viewedBy.concat({ name: user.name, ID: user._id, EMailAddress: user.EMailAddress })
            dB.collection("videos").updateOne({ _id: _ID }, { $set: { viewedBy: _viewedBy } })
        }
        else {
            for (let viewer of viewedBy) {
                if (viewer.ID == req.params.UID) {
                    alreadyViewed = true
                }
            }
            if (alreadyViewed == false) {
                let user = await dB.collection("users").findOne({ _id: _UID })
                let _viewedBy = viewedBy.concat({ name: user.name, ID: user._id, EMailAddress: user.EMailAddress })
                dB.collection("videos").updateOne({ _id: _ID }, { $set: { viewedBy: _viewedBy } })
            }
        }

        res.json({ success: true, video })
    }
    catch (error) {
        res.json({ success: false })
    }

}
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
   console.log("Req Body",req.body)  
    try {
        req.body.uploadedByName=req.user.name
        req.body.uploadedByProfilePhotoUrl=req.user.profilePhotoUrl
        req.body.uploadedBy=req.user.id

        const video=new VideoModel(req.body)
       await  video.save()
        return res.json({ success: true })
    }
    catch (error) {
        return res.json({ success: false,message:error.message})
    }

}
exports.likeVideo=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let alreadyLiked = false
    let _UID = new ObjectId(req.params.UID)
    try {
        let _ID = new ObjectId(req.params.ID)
        let video = await dB.collection("videos").findOne({ _id: _ID })
        let likedBy = video.likedBy
        console.log(likedBy)
        console.log(video)
        if (likedBy.length == 0) {
            let user = await dB.collection("users").findOne({ _id: _UID })
            //({title:"Added A New Video",videoThumbnailUrl:req.body.thumbnailUrl,sentBy:req.params.UID, sentTo:follower.ID, videoID:video._id,userName:user.name,userProfilePhotoUrl:user.profilePhotoUrl})
            if(req.params.UID!=video.createdBy)
            {
            await dB.collection("notifications").insertOne({ title: "Liked Your Video", videoThumbnailUrl: video.thumbnailUrl, sentBy: req.params.UID, sentTo: video.createdBy, videoID: video._id, userName: user.name, userProfilePhotoUrl: user.profilePhotoUrl, addedOn: new Date().toLocaleDateString().split("T")[0], Type: "Liked" })
            }

            let _likedBy = likedBy.concat({ name: user.name, ID: user._id, EMailAddress: user.EMailAddress })
            await dB.collection("videos").updateOne({ _id: _ID }, { $set: { likedBy: _likedBy } })
        }
        else {
            for (let viewer of likedBy) {
                if (viewer.ID == req.params.UID) {
                    alreadyLiked = true
                }
            }
            if (alreadyLiked == false) {
                let user = await dB.collection("users").findOne({ _id: _UID })
                if(req.params.UID!=video.createdBy)
                {
                await dB.collection("notifications").insertOne({ title: "Liked Your Video", videoThumbnailUrl: video.thumbnailUrl, sentBy: req.params.UID, sentTo: video.createdBy, videoID: video._id, userName: user.name, userProfilePhotoUrl: user.profilePhotoUrl, addedOn: new Date().toLocaleDateString().split("T")[0], Type: "Liked" })


                }
                let _likedBy = likedBy.concat({ name: user.name, ID: user._id, EMailAddress: user.EMailAddress })
                dB.collection("videos").updateOne({ _id: _ID }, { $set: { likedBy: _likedBy } })
            }
            else {
                let user = await dB.collection("users").findOne({ _id: _UID })
                let _likedBy = likedBy.filter((viewer) => {
                    return (viewer.ID != req.params.UID)
                })

                await dB.collection("videos").updateOne({ _id: _ID }, { $set: { likedBy: _likedBy } })
            }
        }
        res.json({ success: true, video })
    }
    catch (error) {
        res.json({ success: false })
    }

}
exports.addComment=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let _ID = new ObjectId(req.params.ID)
    let _UID = new ObjectId(req.params.UID)
    let currentDate = new Date().toLocaleDateString().split("T")[0]
    try {
        let video = await dB.collection("videos").findOne({ _id: _ID })
        let comments = video.comments
        let user = await dB.collection("users").findOne({ _id: _UID })
        if(req.params.UID!=video.createdBy)
        {
        await dB.collection("notifications").insertOne({ title: "Commented Your Video", videoThumbnailUrl: video.thumbnailUrl, videoID: video._id, sentTo: video.createdBy, sentBy: req.params.UID, userName: user.name, userProfilePhotoUrl: user.profilePhotoUrl, addedOn: new Date().toLocaleDateString().split("T")[0], Type: "Commented" })
        }
        let _comments = comments.concat({ userName: user.name, userProfilePhotoUrl: user.profilePhotoUrl, UID: user._id, text: req.body.text, addedOn: currentDate ,ID:Math.random().toString()})
        await dB.collection("videos").updateOne({ _id: _ID }, { $set: { comments: _comments } })
        res.json({ success: true })
    }
    catch (error) {
        res.json({ success: false })
    }
}
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