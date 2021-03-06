const users = []

// Add user
const addUser = ({ id, username, room, }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username 
    })

    // Validate username
    if (existingUser) {
        return {
            error: "Username already exists!"
        }
    }

    // Store users
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// Remove users
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// Get users
const getUser = (id) => {
    const existingUser = users.find((user) => user.id === id)

    if (!existingUser) {
        return {
            error: 'No user found.'
        }
    }

    return existingUser
}

// Get users in room
const getUsersInRoom = (room) => {
    const userList = users.filter((user) => user.room === room)

    if (!userList) {
        return []
    }

    return userList
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}