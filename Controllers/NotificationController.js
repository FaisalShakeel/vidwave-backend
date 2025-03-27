const NotificationModel=require('../Models/NotificationModel')
exports.getMyNotifications=async (req, res) => {
    const userId=req.user.id
    try {
     const notifications=await NotificationModel.find({sentTo:userId})    
        res.json({ success: true, notifications })
    }
    catch (error) {
        res.json({ success: false,message:error.message})

    }

}
