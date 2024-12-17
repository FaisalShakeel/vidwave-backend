const { Schema, default: mongoose } = require("mongoose")

let NotificationSchema = new mongoose.Schema({ title: { type: String, required: true },
     videoThumbnailUrl: { type: String },
      sentTo: { type: String, required: true },
       sentBy: { type: String, required: true },
        userProfilePhotoUrl: { type: String, required: true },
         userName: { type: String, required: true },
          Type: { type: String, required: true, videoID: { type: String, default: "" },
           addedOn: { type: String, default: new Date().toLocaleDateString().split("T")[0] }
         } })
const NotificationModel=mongoose.model("notifications",NotificationSchema)
module.exports=NotificationModel         