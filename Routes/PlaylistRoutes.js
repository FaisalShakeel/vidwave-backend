const express=require('express')
const verifyUser = require('../Middlewares/VerifyUser')
const { createPlaylist, getMyPlaylists, addToPlaylist } = require('../Controllers/PlaylistController')
let playlistRouter=express.Router()
playlistRouter.post("/create",verifyUser,createPlaylist)
playlistRouter.get("/getmyplaylists",verifyUser,getMyPlaylists)
playlistRouter.post("/addtoplaylist",verifyUser,addToPlaylist)
module.exports=playlistRouter