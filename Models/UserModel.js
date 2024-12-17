const { Schema, default: mongoose } = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    EMailAddress: {
        type: String,
        required: true
    },
    passWord: {
        type: String,
        required: true
    },
    bio: {
        type: String,
    },
    profilePhotoUrl: {
        type:String,
        required: true
    },
    followings: {
        type: Array,
        default: []
    },
    followers: {
        type: Array,
        default: []
    },

    joinedOn: {
        type: String,
        default: new Date().toLocaleDateString().split("T")[0]
    }
})
const UserModel=mongoose.model("users",UserSchema)
module.exports=UserModel