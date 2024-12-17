const express=require('express')
const { getMyNotifications, deleteNotification } = require('../Controllers/NotificationController')
let notificationRouter=express.Router()
app.get("/getnotifications/:UID",getMyNotifications )
app.delete("/deletenotification/:ID",deleteNotification)
module.exports={notificationRouter}