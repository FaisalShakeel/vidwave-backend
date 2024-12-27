const { Schema, default: mongoose } = require("mongoose");

const playlistScheme= new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    createdBy:{
        type:String,
        required:true
    },
    videos:{
        type:Array,
        default:[]
    }
})
const PlaylistModel=mongoose.model("playlists",playlistScheme)
module.exports=PlaylistModel