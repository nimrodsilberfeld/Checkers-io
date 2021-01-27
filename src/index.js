const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const port = process.env.PORT || 3000
require('./db/mongoose')
const userRouter = require('./route/userRoute')
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
}

module.exports = {
    update_num_of_losses,
    update_num_of_wins,
    findUser
}

require('./utils/socket')(io)


server.listen(port, () => {
    console.log('Server run on port ', port)
})