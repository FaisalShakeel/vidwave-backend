const { Schema, default: mongoose } = require("mongoose")

const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    likedBy: {
        type: Array,

        default: []
    },
    viewedBy: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    },
    uploadedByName:
    {
        type: String,
        required: true
    },
    uploadedByProfilePhotoUrl: {
        type: String,
        required: true
    },
    tags:{
        type:Array,
        default:[]
    },
    savedBy: {
        type: Array,
        default: []
    },
    uploadedBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const VideoModel=mongoose.model("videos",VideoSchema)
module.exports=VideoModel