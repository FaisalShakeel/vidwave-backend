const { Schema, default: mongoose } = require("mongoose");

let NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoThumbnailUrl: { type: String },
  sentTo: { type: String, required: true },
  sentBy: { type: String, required: true },
  sentByPhotoUrl: { type: String, required: true },
  sentByName: { type: String, required: true },
  type: { type: String, required: true }, // Make sure `type` ends here
  videoId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const NotificationModel = mongoose.model("notifications", NotificationSchema);
module.exports = NotificationModel;
