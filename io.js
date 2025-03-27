
const socketIo = require('socket.io');
let IO;
let connectedUsers = [];



const initializeSocket = (server) => {
    console.log("Intialzing Socket",server)
    IO = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        pingTimeout: 120000,    // 2 minutes
  pingInterval: 30000
    });

    IO.on("connection", (socket) => {
        let userId = socket.handshake.query.userId;
        if (!userId) {
            return socket.disconnect();
        }

        

        let alreadyConnected = connectedUsers.some(user => user.ID === userId);
        if (alreadyConnected) {
            connectedUsers = connectedUsers.filter(user => user.ID !== userId);
        }
        connectedUsers.push({ ID: userId, socketId: socket.id });

        console.log("A New User Connected With Id:", socket.id);
        console.log(connectedUsers);

        socket.on('disconnect', (reason) => {
            connectedUsers = connectedUsers.filter(user => user.socketId !== socket.id);
            console.log(connectedUsers);
            console.log("User with Id", socket.id, "has been disconnected due to:", reason);
        });
        socket.on('reconnect',(attemptNumber)=>{
            console.log("Client Reconnected After",attemptNumber)
        })
    });
};

const getIO = () => {
    if (!IO) {
        throw new Error("Socket.IO not initialized!");
    }
    return IO;
};

const getReceiverSocketId = (userId) => {
    console.log("Getting Socket Id Of Person With Id",userId)
    const user = connectedUsers.find(user => user.ID === userId);
    console.log("Found User",user)
    console.log("Connected Users",connectedUsers)
    return user ? user.socketId : ""; // Return null if not found
};

module.exports = { initializeSocket, getReceiverSocketId, getIO };
