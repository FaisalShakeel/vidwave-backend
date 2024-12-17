require('dotenv').config();
const express = require("express")
const cors = require('cors')
const { MongoClient, ObjectId } = require("mongodb")
const userRouter=require('./Routes/UserRoutes')
const videoRouter=require('./Routes/VideoRoutes')
const mongoose = require("mongoose")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use("/users",userRouter)
app.use("/videos",videoRouter)
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
        app.listen(PORT, () => {
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
It Allows you to make requests from the local host
export const moongose.model("Users",UserSchema)
export const moongose.model("Videos",VideoSchema)
10+Projects Using Next JS And Node JS

findOne(_id:_ID)

video.likedBy.length


ID

UserName
EMailAddress


project name


author.


Schemas

this is how can create full stack apps using these technologies

npm init
npm install express to add express framework
npm install mongodb  to connect with mongodb
npm install mongoose to create schemas and models
npm install cors  to allow the local host to make all kinds of requests like post,put,delete etc.
full stack youtube clone using nextjs and chakraui along with nodejs backend development.

ELearning AppUsing Next JS And Node JS.



Features

Tools

Learnings.

Here is the first notification.


There will be an other post.

disliked you video

else


userP name title added on videoUrl.


There  is nothing like that.

text

senderID
receiverID
mediaUrl
mediaType

Write Message Image Video.

Chatty



deleteMessage/Id/messageId


if(senderID==UID)
{
    dB.collection("messages").deleteOne({_id:req.params.messageId})
}

Hi!

Hey

How Are You?

UPP UN.7


senderID==UID||senderID==receiverID &&

messages.concat(message)
setMessage

message

Simple File System Using Next Js And Node JS

Create This JobHub App.

Close This Job

isClosed:true

proposals

Similar Jobs On JobHub

Stripe

Does It Work On The frontend part or the backend part?

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

300. 2 years plan. Making big money out of it.Here.

I have a contract UK based I won't be available full time.I can help you out with fixes like quick fixes.Thanks was an amazing journy believe me.

400 Posts About Projects. 800 Days. 2 Years You will be like up and running.

6 Months.

150k.

6 next 2 months ka revenue dekhna
600k

20+ More Projects. Which can give an awesome list of clients to work with.

Portfolio Builder And Suggests Jobs Based On His Portfolio.

He cannot view his profile. He cannot leave a review,like movie or add a movie to watch later.

he is there with this mindset.

200 Posts On Instagram Account,Facebook,Linked In

200 Posts On This Projects Are Here for sure

JobHub is the platform where people can post and find Jobs

CI CD    :Continous Integration,Continous DeployMent.

Within 6 months,1 year experience really matters.

Login,Sign Up,Artist. Admin Panel. Songs,PlayLists,Artists,Profiles,Albums,Liked,Category,Podcast Feature.

AI And ML Based Web Apps. 15+ Web Apps AI And ML Driven

Real Estate App

ECommerce App

Chat App

Categories

Making $5k As A Full Stack Web App Dev. Never go there with this mindset

He is there with this mindset. How can I go there

Feature Section . Projects Section Completed

Post Job Choose Company

Next JS AI Tools

10 Tools

AI Based Projects

250 Posts On Linked In

20-25 Posts

40-50 days tak ki posts hon

40+ Posts On This Project ELearning
40+ Posts On Linked In
40+ Fiverr
40+ Upwork

150 + Posts



300 Posts

Next Js+AI driven solutions for this purpose.

AI And ML expert

Just completed a project using NextJs And AI

Having A good internet connection is very important. He is there with this mindset.That is possible only then.


250k

180k tak aa jaye ga.

yaar boht cost effective rkha num ny reposter and triphog bhi cost effective he hai tha tou ab thora charges up kren yaar.Thanks
1 CR In Year Through Web Development

250k


CDN Integration. Views  Impressions, How will it work

posts with more likes and comments should be on top. then so on

Making It Big in the USA. Having a strong profile is very important

You can visit our facebook,linked in,twitter and instagram pages

There will be a backend person for this purpose

There will be a list of people working on this software

150k

180k tak kr dain for this. boht time lg jata is main.

300k for this purpose. Go 250k+150=400k

200k 600k

20 Lacs

Go And Visit Our Profile.

Will buy. Are hosting,your AWS

Go And Find High Paying Clients

He is making it work properly.

Getting it right for us. There will be people working for us with this mindset.

He is there with this mindset. get him out of the equation and make it work properly.

Shorts Section.

comments,like share.


Youtube Studio

YouTube.

Short

Recently Watched Movies

12-13

30

2 Months Content Is Done And Dusted.

Twitter Never estimate twitter when it comes to live project building in this course.
*/
 