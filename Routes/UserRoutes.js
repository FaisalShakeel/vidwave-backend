const express=require('express')
const { createAccount, updatedUser, login, getProfile, getUser, follow, getDashboardStatistics, getAnalytics, getProfileBasicInfo, updateProfile, changePassword } = require('../Controllers/UserController')
const verifyUser = require('../Middlewares/VerifyUser')
const userRouter=express.Router()
userRouter.post("/create-account",createAccount)
userRouter.post("/login",login )
userRouter.get("/profile/:id",getProfile )
userRouter.get("/profile-info",verifyUser,getProfileBasicInfo )
userRouter.put("/update-profile",verifyUser,updateProfile)
userRouter.put("/change-password",verifyUser,changePassword)
userRouter.post("/follow",verifyUser,follow )
userRouter.get("/dashboard-statistics",verifyUser,getDashboardStatistics)
userRouter.get("/analytics",verifyUser,getAnalytics)
module.exports=userRouter