
const { addUser, getAllConnectedUsers, getUser, removeUser, getUsersInRoom } = require('../utils/users')
const { update_num_of_losses, update_num_of_wins, findUser } = require('../index')
let currentPlayer
module.exports = function (io) {


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


        socket.on('disconnect', () => {
            removeUser(socket.id)
            io.emit('LobbyData', {
                users: getAllConnectedUsers()
            })
        })
    })
}