const socket = io()
// const url = "http://localhost:3000"
const url = "https://nim-checkers-io.herokuapp.com"
const li = document.getElementsByTagName("li")
let invitedPlayer = ''
let userSocketId = ''
let usersList = document.getElementById('usersList')
let user = undefined
let inviteAlert = document.getElementById('inviteAlert')
let acceptButton = document.getElementById('acceptButton')
let nameOfUserInfo = document.getElementById('nameOfUser-info')
let ratingInfo = document.getElementById('rating-info')
let numofGamesInfo = document.getElementById('numofGames-info')
let numofWines = document.getElementById('numofWines-info')
let numofLoses = document.getElementById('numofLoses-info')
let userId = sessionStorage.getItem("id")
let invitationModal = document.getElementById('invitation-modal')
let invite = document.getElementById('invite')
let gotInviteModal = document.getElementById('gotInvite-modal')
let gotInvite = document.getElementById('gotInvite')
let declineGame = document.getElementById('declineGame')
let disconnectButton = document.getElementById('disconnect')

//Templates
const usersLobbyTamplate = document.querySelector('#lobby-users-template').innerHTML

//OPTION
const { username } = Qs.parse(location.search, { ignoreQueryPrefix: true })  //take the url line info("usaername=name") and parse it
const { id } = Qs.parse(location.search, { ignoreQueryPrefix: true })

console.log("id from url")
console.log(id)



async function LogOutUser() {

    const response = await fetch(url + "/users/logout", {
        method: "POST",
        headers: {
            'Authorization': sessionStorage.getItem('token')
        }
    }).then((res) => {
        if (res.ok) {
            console.log("User logout")
        } else {
            throw new Error(res.status)
        }
    }).catch((err) => {
        console.log(err)
    })
    return response
}

const is_user_login = async (url = '') => {

    const response = await fetch(url, {
        headers: { 'Authorization': sessionStorage.getItem('token') }
    })
        .then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error(res.status)
            }
        }).catch((err) => {
            throw err
        })
    return response
}

is_user_login(url + `/users/${id}`).then((data) => {
    console.log("lobby login user")
    console.log(data)
    nameOfUserInfo.innerHTML = data.name.toUpperCase()
    ratingInfo.innerHTML = "Rating " + data.score
    numofGamesInfo.innerHTML = "Games " + data.numberOfGames
    numofWines.innerHTML = "Wins " + data.numberOfWins
    numofLoses.innerHTML = "Losses " + data.numberOfLosses
})

//joining the lobby
socket.emit('join', { userId }, (error) => {

    if (error) {
        alert(error)
        // location.href = '/'
    }

})

//sessionStorage.clear()
socket.on("welcomeToLobby", (message) => {
    console.log(message)
})

socket.on('userInfo', ({ user }) => {

    //sessionStorage.setItem("socketId", user.id)
})

//pressing player will send game invatation
const selectPlayer = (li) => {
    for (let index = 0; index < li.length; index++) {
        const element = li[index]

        element.addEventListener("click", () => {
            console.log(element.id)
            socket.emit("invite", element.id)
        })
    }
}

socket.on("whoInvite", (data) => {
    console.log("i invite")
    console.log(data)
    invitationModal.style.display = "block"
    invite.innerHTML = "Invitation sent to " + data.username.toUpperCase() + "\nWaiting for response"
})

socket.on("inMiddleOfAgame", (invitedPlayer) => {
    console.log(invitedPlayer)
    alert(invitedPlayer.invitedPlayer.username + " is in the middle of a game")
})

//when you get invited to game
socket.on('getInvite', (data) => {
    gotInviteModal.style.display = "flex"
    gotInvite.innerHTML = "Got invitation from " + data.invitingPlayerName.username.toUpperCase()
    // inviteAlert.style.display = "block"
    acceptButton.addEventListener('click', () => {
        let isConfirm = true

        if (isConfirm) {
            txt = "You pressed OK!";
            socket.emit("confirm-game-invitation", {
                isConfirm,
                socketId: data.invitingPlayerId,
                room: data.room
            })
        }

    })
    declineGame.addEventListener("click", () => {
        gotInviteModal.style.display = "none"
        let inviter = data.invitingPlayerId
        socket.emit("declineGame", { inviter })
    })
})

socket.on("playerDeclineGame", (invitingPlayer) => {
    console.log("the decliner is")
    console.log(invitingPlayer.user.username)
    invitationModal.style.display = "block"
    invite.innerHTML = invitingPlayer.user.username + " Decline your game"
    setTimeout(function () {
        invitationModal.style.display = "none"
    }, 3000);
})
const update_num_of_games = async (id, data = {}) => {

    const response = await fetch(url + `/users/${id}`, {
        method: "PATCH",
        headers: {
            'Authorization': sessionStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error(res.status)
            }
        }).catch((err) => {
            return err
        })
    return response

}

socket.on('confirm-play', (data) => {

    console.log("players on room")
    console.log(data.playeresInRoom)

    location.href = "https://nim-checkers-io.herokuapp.com/checkers.html?id=" + socket.id + "&room=" + data.room + "&mongoId=" + id + ""

})





socket.on("start-game", ({ user }) => {
    console.log("start-game event")
    console.log(user)
})

//render all login player to the lobby
socket.on('LobbyData', ({ users }) => {
    // users = users.filter((user) => {
    //     return user.room == "lobby" && user.username !== username
    // })
    users = users.sort(function (a, b) {
        return parseFloat(b.rating) - parseFloat(a.rating)
    })
    users = users.filter((user) => {
        return user.room == "lobby" && user.username !== username
    })
    //console.log("lobby users:")
    //console.log(lobbyUser)
    const html = Mustache.render(usersLobbyTamplate, {
        users
    })
    document.querySelector('#usersLoggin').innerHTML = html
    //console.log(lobbyUser)
    selectPlayer(li)
})


disconnectButton.addEventListener('click', () => {
    LogOutUser().then((res) => {
        console.log(res)
        sessionStorage.clear()
        location.href = '/'
    }).catch((err) => {
        console.log(err)
    })
})