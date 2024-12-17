const NotificationModel=require('../Models/NotificationModel')
exports.getMyNotifications=async (req, res) => {
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    try {
        let MyNotifications = []
        let notifications = await dB.collection("notifications").find().toArray()
        MyNotifications = notifications.filter((notification) => { return notification.sentTo == req.params.UID })
        res.json({ success: true, notifications: MyNotifications })
    }
    catch (error) {
        res.json({ success: false })

    }

}
exports.deleteNotification=async(req,res)=>{
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("YouTube")
    let _ID  = new ObjectId(req.params.ID)
    try
    {
        await dB.collection("notifications").deleteOne({_id:_ID})
        console.log("Notification Deleted")
        res.json({success:true})
    }
    catch(e)
    {
        res.json({success:false})

    }
}