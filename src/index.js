const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words') 
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


// Creating an Express app
const app = express()

// Creating an http server
const server = http.createServer(app)

// Create a new instance of socket.io and configuring it with the server
const io = socketio(server)

// Specifying the port
const port = process.env.PORT || 3000

// Define paths for Express config
const publicDirPath = path.join(__dirname, '../public')


// Serving the public directory
app.use(express.static(publicDirPath))

// Send a message when a client is connected
io.on('connection', (socket) => {
    console.log('New Websocket connection!')

    // Listen for join room event from client
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        // Emitting welcome message to client joining a room
        socket.emit('message', generateMessage('Admin', 'Welcome!'))

        // Brodacasting events to clients when a new user joins a room
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        // Emit list of users in a room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    // Listen for message event from client. Callback parameter is used for receiving acknowledgement
    socket.on('sendMessage', (payload , callback) => {
        const user = getUser(socket.id)

        // send message to all connected clients
        io.to(user.room).emit('message', generateMessage(user.username, payload.textMessage))

        callback()
    })

    // Listen for location event from client
    socket.on('sendLocation', (userLocation, callback) => {
        const user = getUser(socket.id)

        // Send user location to connected clients
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`))

        callback()
    })

    // Send message when a client is disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })



})



// Setting up a server
server.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
})