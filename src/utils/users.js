const users = []

const addUser = ({ id, userId, username, room, rating }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    // room = room.trim().toLowerCase()

    //validate the data 
    if (!username) {
        return {
            error: 'Username required!'
        }
    }

    //Check for existing username
    const exisitingUser = users.find((user) => {
        return user.username === username
    })

    //validate user
    if (exisitingUser) {
        // removeUser(exisitingUser)
        console.log("existing user")
        console.log(exisitingUser.id)
        removeUser(exisitingUser.id)
        // return {
        //     error: 'Username is in use!'

        // }
    }

    //store user
    const player = { id, userId, username, room, rating }
    users.push(player)
    return { player }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getAllConnectedUsers = () => {
    return users
}


const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUserByName = (name) => {
    return users.find((user) => user.username === name)
}


const getUsersInRoom = (room) => {
    let usersInroom = []
    usersInroom = users.filter((user) => user.room === room)
    return usersInroom
}

module.exports = {
    addUser,
    getAllConnectedUsers,
    getUser,
    getUsersInRoom,
    removeUser

}