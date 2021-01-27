const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const port =process.env.PORT|| 3000
require('./db/mongoose')
const userRouter = require('./route/userRoute')
const { addUser, getAllConnectedUsers, getUser, removeUser, getUsersInRoom } = require('./utils/users')
const User = require('./models/userModel')


const publicDirectoryPath = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
app.use(express.static(publicDirectoryPath))
app.use(express.json())
app.use(userRouter)

const findUser = async (id) => {
    let user = await User.findById(id)
    return user

}


const update_num_of_wins = async (id, whoWon) => {
    let newRate
    if (whoWon.won[0].rating == whoWon.lose[0].rating) {
        newRate = 5
    }
    if (whoWon.won[0].rating > whoWon.lose[0].rating) {
        newRate = 4
    }
    if (whoWon.won[0].rating < whoWon.lose[0].rating) {
        newRate = 6
    }
    const update = { $inc: { numberOfGames: 1, numberOfWins: 1, score: newRate } }
    let user = await User.findByIdAndUpdate(id, update)
    await user.save()
    console.log("user after update!!")
    console.log(user)
}



const update_num_of_losses = async (id, whoWon) => {
    let newRate

    if (whoWon.won[0].rating == whoWon.lose[0].rating) {
        newRate = -5
    }
    if (whoWon.won[0].rating > whoWon.lose[0].rating) {
        newRate = -4
    }
    if (whoWon.won[0].rating < whoWon.lose[0].rating) {
        newRate = -6
    }
    if ((whoWon.lose[0].rating + newRate) <= 0) {
        newRate = -(whoWon.lose[0].rating)
    }

    let update = { $inc: { numberOfGames: 1, numberOfLosses: 1, score: newRate } }
    let user = await User.findByIdAndUpdate(id, update)
    await user.save()
    console.log("user after update!!")
    console.log(user)
}


let currentPlayer

io.on('connection', (socket) => {
    console.log("new web socket connection")



    socket.on('join', async (id) => {
        let ID = id.userId
        console.log(ID)
        currentPlayer = await findUser(ID)
        console.log(currentPlayer)
        if (currentPlayer) {

            const room = "lobby"
            const { player } = addUser({ id: socket.id, userId: ID, username: currentPlayer.name, room: "lobby", rating: currentPlayer.score })

            console.log("add user:", { player })
            socket.join("lobby")
            socket.emit('userInfo', ({ player }))
            io.to(room).emit("welcomeToLobby", ({ message: "welcome to the lobby" }))
            io.emit('LobbyData', {
                users: getAllConnectedUsers()
            })
        }
        //callback()
    })

    socket.on("reJoinLobby", () => {
        io.emit('LobbyData', {
            users: getAllConnectedUsers()
        })
    })

    socket.on('invite', (playerToInviteID) => {
        const userToInvite = getUser(playerToInviteID)
        socket.emit("whoInvite", userToInvite)
        const room = playerToInviteID
        const user = getUser(playerToInviteID)
        const invitingPlayerId = socket.id
        const invitingPlayerName = getUser(socket.id)
        let invitedPlayer = getUser(playerToInviteID)
        console.log("invited player room")
        console.log(invitedPlayer.room)
        if (invitedPlayer.room === "lobby") {
            socket.join(room)
            socket.broadcast.to(playerToInviteID).emit('getInvite', { room, invitingPlayerId, user, invitingPlayerName })
        } else {
            socket.emit("inMiddleOfAgame", ({ invitedPlayer }))
        }



    })
    socket.on("confirm-game-invitation", (data) => {
        console.log(data)
        if (data.isConfirm) {
            const room = data.room
            socket.join(room)
            const user1 = getUser(socket.id)
            const user2 = getUser(data.socketId)

            console.log("============")
            // update_num_of_games(user1.userId)
            // update_num_of_games(user2.userId)
            console.log("============")
            console.log("confirm game invitation!!!!")
            console.log(user1)
            console.log(user2)
            user1.room = room
            user2.room = room
            const playeresInRoom = getUsersInRoom(data.room)
            console.log("user in room!!")
            console.log(playeresInRoom)
            io.to(data.room).emit("confirm-play", { playeresInRoom, room })
            io.to(data.room).emit("start-game", playeresInRoom)

        }

    })

    socket.on("declineGame", (inviter) => {
        console.log("the inviter is :")
        console.log(inviter)
        let user = getUser(socket.id)
        socket.broadcast.to(inviter.inviter).emit("playerDeclineGame", { user })
    })

    socket.on("play-now", (data) => {
        console.log("data from rooms")
        console.log(data.thisRoom)
        console.log(data)
        const playeresInRoom = getUsersInRoom(data.thisRoom)
        socket.join(data.thisRoom)
        io.to(data.thisRoom).emit("play-now", (data, playeresInRoom))
    })




    socket.on("opponnentMoveFromTo", (data) => {
        let woodblock = data.woodblock
        let piece = data.piece
        let room = data.thisRoom
        // console.log(room)
        // console.log(woodblock)
        // console.log(piece)
        socket.to(room).emit("opponentMove", ({ data }))
    })

    socket.on("joinGame", () => {
        let user = getUser(socket.id)
        user.room = socket.id
        user = getUser(socket.id)
        console.log(user)
        console.log("line 65 " + user.username + " go to room ", socket.id)
        socket.join(socket.id)
        io.to(socket.id).emit("welcome", ({ message: "welcome" }))
        io.to(socket.id).emit("start-game", { user: user })
    })

    socket.on("gameWon", async (whoWon) => {
        let winner = await findUser(whoWon.id)
        console.log(whoWon)
        console.log("i am:")
        console.log(winner)
        console.log("The winner is:")
        console.log(whoWon.won[0])
        update_num_of_wins(whoWon.won[0].userId, whoWon)
        console.log("the loser is: ")
        update_num_of_losses(whoWon.lose[0].userId, whoWon)
        console.log(whoWon.lose[0])
    })


    // socket.on('disconnect', () => {
    //     removeUser(socket.id)

    // })
})


server.listen(port, () => {
    console.log('Server run on port ', port)
})