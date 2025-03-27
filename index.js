require('dotenv').config();
const express = require("express")
const cors = require('cors')
const userRouter=require('./Routes/UserRoutes')
const videoRouter=require('./Routes/VideoRoutes')
const playlistRouter=require('./Routes/PlaylistRoutes')
const notificationRouter  = require('./Routes/NotificationRoutes');

const http=require('http')
const { initializeSocket } = require('./io'); // Import the module
const mongoose = require("mongoose");
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use("/users",userRouter)
app.use("/videos",videoRouter)
app.use("/playlists",playlistRouter)
app.use("/notifications",notificationRouter)
let server = http.createServer(app);
// Initialize Socket.IO after server setup
initializeSocket(server);
async function connectWithDB()
{
try{
await mongoose.connect("mongodb://faisalshakeel120:C0nOCnyiyWq7kXpE@ac-hoy3oml-shard-00-00.9ipw5ey.mongodb.net:27017,ac-hoy3oml-shard-00-01.9ipw5ey.mongodb.net:27017,ac-hoy3oml-shard-00-02.9ipw5ey.mongodb.net:27017/vidwavewebapp?ssl=true&replicaSet=atlas-26qf5k-shard-0&authSource=admin&retryWrites=true&w=majority&appName=moviemate",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})

console.log("Connected To Mongo DB")
}
    catch(e)
    {
        console.log(e.message)
        console.log("There Was An Error While Connecting To The Database")
    }
}
connectWithDB()




const PORT = process.env.PORT || 5000
startServer = async () => {
    try {
    server.listen(PORT, () => {
            console.log("Listening ON" + PORT)
        })

    }
    catch (error) {
        console.log(error)
    }
}
startServer()
console.log("Done!")
/*
Spotify
ELearning App
ECom
JobHub
TikTok
Instagram
Twitter
Food Delivery
Fiverr
Upwork
Chatty
Live Streaming
Even Managment
Hotel Booking
Google Docs
Slack
Movie App
YouTube
Real Estate
Doctor Booking Web App
EBook Web App
Auction System
*/
 