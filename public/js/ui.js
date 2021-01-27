
const socket = io()
// const url = "http://localhost:3000"
const url = "https://nim-checkers-io.herokuapp.com"
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");
const thisRoom = urlParams.get("room");
const mongoId = urlParams.get("mongoId")
console.log(userId)
console.log(thisRoom)


socket.emit("play-now", {
    userId,
    thisRoom
})




socket.on("start-game", (users) => {
    console.log(users)

})

import { addingEvent } from './logic.js'
import {
    piece_Move_From, piece_Move_To, firstPlayerTurn, TheMovedPiece, validMove, pieceWhoMoveFirst,
    found_possible_Eating_Move, possibleMoveBefore, highLightedBlock, GamePieceArray, test
} from './logic.js'
import {
    declareMovedPiece, declarePieceMoveTo, CheckForSkipEatingMove,
    sendToMovesFunction, declareToNull, declareToUndefined, declareToEmptyArray,
    Checking_For_Legal_Move, CheckIfPieceTurnToQueen, ChangeTurn,
    possibleMoveTrueOrFales, validMoveTrueOrFales, DoesThePieceIsQueen, Column_Of_Piece, Row_Of_Piece, FillGameBoardArray
} from './logic.js'
import { CheckPreMove } from './logic.js'
let woodBlocks = document.getElementsByClassName('wood-block')
let MoveHighlight = []
const gameBoard = document.getElementsByTagName("table")[0]
const errorMessage = document.getElementById('error-Message2')
let redTurnText = document.getElementById('red-turn-text')
let blackTurnText = document.getElementById('black-turn-text')
const redPieces = document.getElementsByClassName('red-piece')
const blackPieces = document.getElementsByClassName('black-piece')
const backdrop = document.querySelector(".backdrop");
const modal = document.querySelector(".modal");
const modalTitle = document.getElementById('modal__title')

let isMyTurn = true




let TheSecondPlayer
let ThefirstPlayer


socket.on("play-now", (data, playeresInRoom) => {

    console.log(data)

    if (userId === thisRoom) {
        ChangeTurn()
        isMyTurn = false
        TheSecondPlayer = data.filter((player) => { return player.id == userId })
        ThefirstPlayer = data.filter((player) => { return player.id !== userId })
        console.log(ThefirstPlayer)
        console.log(TheSecondPlayer)
        redTurnText.innerHTML = ThefirstPlayer[0].username
        blackTurnText.innerHTML = TheSecondPlayer[0].username
        document.getElementById('backToLobby').href = `./lobby.html?username=${TheSecondPlayer[0].username}&id=${mongoId}`
    } else {
        TheSecondPlayer = data.filter((player) => { return player.id !== userId })
        ThefirstPlayer = data.filter((player) => { return player.id == userId })
        console.log(ThefirstPlayer)
        console.log(TheSecondPlayer)
        redTurnText.innerHTML = ThefirstPlayer[0].username
        blackTurnText.innerHTML = TheSecondPlayer[0].username
        document.getElementById('backToLobby').href = `./lobby.html?username=${ThefirstPlayer[0].username}&id=${mongoId}`
    }

    console.log("first player turn?")
    console.log(firstPlayerTurn)
    if (userId === thisRoom && !firstPlayerTurn) {
        ChangeTurn()
    }
    console.log("first player turn?")
    console.log(firstPlayerTurn)
})



socket.on("switchTurn", (GamePieceArray) => {
    console.log("opponent made is move")
    console.log("UI GamePieceArray")
    console.log("opponent Board:")
    let row = '';
    let count = 1
    for (let j = 0; j < 64; j++, count++) {
        row += GamePieceArray[j]
        if (count % 8 == 0) {
            console.log(row)
            row = ''
        }
    }

    ChangeTurn()
    isMyTurn = !isMyTurn
    console.log(firstPlayerTurn)
    console.log(isMyTurn)
    redTurnText.style.color = firstPlayerTurn ? "black" : "lightgray"
    blackTurnText.style.color = firstPlayerTurn ? "lightgray" : "black"
})


socket.on("opponentMove", (data) => {
    console.log(data)

    let piece = data.data.piece
    let woodblock = data.data.woodblock
    console.log("opponnet move from ", piece, " to ", woodblock)
    piece_Move_From[0] = piece

    console.log(woodBlocks[woodblock - 1])

    pressWoodBlock(woodBlocks[woodblock - 1], true)
})


function creating_The_Board() {
    let TDarray = []
    for (let i = 1; i <= 8; i++) {
        const newTR = document.createElement('TR')
        gameBoard.appendChild(newTR)
        for (let j = 1; j <= 8; j++) {
            const newTD = document.createElement('TD')
            newTD.classList.add("wood-block")
            if (i % 2 != 0) { //שורה אי זוגית
                if (j % 2 != 0) { newTD.classList.add("noPieceHere") }
                else {
                    if (i <= 3) {
                        const redPiece = document.createElement('span')
                        redPiece.classList.add("red-piece")
                        redPiece.classList.add("wood-piece")
                        newTD.appendChild(redPiece)
                    }
                    if (i > 5) {
                        const blackPiece = document.createElement('span')
                        blackPiece.classList.add("black-piece")
                        blackPiece.classList.add("wood-piece")
                        newTD.appendChild(blackPiece)
                    }
                }
            } else {  //שורה זוגית
                if (j % 2 == 0) { newTD.classList.add("noPieceHere") }
                else {
                    if (i < 3) {
                        const redPiece = document.createElement('span')
                        redPiece.classList.add("red-piece")
                        redPiece.classList.add("wood-piece")
                        newTD.appendChild(redPiece)
                    }
                    if (i > 5) {
                        const blackPiece = document.createElement('span')
                        blackPiece.classList.add("black-piece")
                        blackPiece.classList.add("wood-piece")
                        newTD.appendChild(blackPiece)
                    }
                }
            }
            TDarray.push(newTD)
            newTR.appendChild(newTD)
        }
    }
    for (let i = 1; i <= 64; i++) {
        TDarray[i - 1].setAttribute("id", i + "")
    }
}
creating_The_Board()
FillGameBoardArray(woodBlocks)




function movingThePiece(woodblock, the_Piece_Is_Queen) {
    console.log("enter moveThePiece function")
    let newSpan

    woodBlocks[piece_Move_From[0] - 1].childNodes[0].remove()
    newSpan = document.createElement('span')
    if (the_Piece_Is_Queen) {
        newSpan.className = firstPlayerTurn ? "redQ-piece wood-piece" : "blackQ-piece wood-piece"
        the_Piece_Is_Queen = false
    } else {
        newSpan.className = firstPlayerTurn ? 'red-piece wood-piece' : 'black-piece wood-piece'
    }
    woodBlocks[piece_Move_To[0] - 1].appendChild(newSpan)
    newSpan.addEventListener('click', pressPiece, false)
    declareToUndefined(TheMovedPiece)
    FillGameBoardArray(woodBlocks)
}


export function pressWoodBlock(wood, opponentMove) {
    let woodblock
    if (!opponentMove) {
        console.log(wood)
        console.log(wood.target.id)
        if (piece_Move_From[0] == undefined) { return }
        woodblock = wood.target

    } else {
        console.log(wood)
        if (piece_Move_From[0] == undefined) { return }
        woodblock = wood
        if (!woodblock.id) { return }
    }

    if (!woodblock.id) { return }
    declarePieceMoveTo(woodblock.id)
    let currentClass = firstPlayerTurn ? "red-piece" : "black-piece"
    let moveFromNum = parseInt(piece_Move_From[0])
    let moveToNum = parseInt(piece_Move_To[0])
    let CurrentPlayerArray = woodBlocks[woodblock.id - 1].childNodes[0]
    let errorMessage2 = document.createElement("h2")
    let the_Piece_Is_Queen = false

    if (!(CheckForSkipEatingMove(moveFromNum))) {
        errorMessage2.id = "error-Message"
        errorMessage.appendChild(errorMessage2)
        errorMessage2.innerHTML = "You have to eat the piece"
        return
    }

    the_Piece_Is_Queen = DoesThePieceIsQueen(piece_Move_From[0])
    if (the_Piece_Is_Queen) { console.log("the piece is QUEEN") }

    if (woodBlocks[woodblock.id - 1].childNodes[0]) { console.log("already taken"); return; }
    CheckPreMove()
    sendToMovesFunction(the_Piece_Is_Queen, moveToNum, moveFromNum, woodBlocks)

    if (!validMove) {
        errorMessage2.id = "error-Message"
        errorMessage.appendChild(errorMessage2)
        errorMessage2.innerHTML = "invalid move"
        declareToNull(pieceWhoMoveFirst)
        return
    }

    movingThePiece(woodblock, the_Piece_Is_Queen)
    if (!opponentMove) {
        socket.emit("opponnentMoveFromTo", ({ woodblock: wood.target.id, piece: piece_Move_From[0], thisRoom: thisRoom }))
    }
    if (possibleMoveBefore) {
        console.log("check for chain")
        validMoveTrueOrFales(false)
        if (highLightedBlock.length > 0)
            for (let x = 0; x < highLightedBlock.length; x++) { highLightedBlock[x].style.backgroundColor = "#BA7A3A" }

        Checking_For_Legal_Move(false, moveToNum - 1, woodBlocks)
        if (found_possible_Eating_Move) {
            highLightedBlock[0].style.backgroundColor = "#BA7A3A"
            console.log("=====================")
            console.log("highlighted blocks:")
            for (let x = 0; x < highLightedBlock.length; x++) { console.log(highLightedBlock[x].id) }
            for (let x = 0; x < highLightedBlock.length; x++) { highLightedBlock[x].style.backgroundColor = "#A9A9A9" }

            declareToEmptyArray(piece_Move_From)
            declareToEmptyArray(piece_Move_To)
            console.log("=====================")
            return
        }
    }
    if (CheckIfPieceTurnToQueen()) {
        console.log("QUEEN!")
        woodBlocks[piece_Move_To[0] - 1].childNodes[0].remove()
        if (firstPlayerTurn) {
            const redQueen = document.createElement('span')
            redQueen.className = "redQ-piece wood-piece"
            woodBlocks[piece_Move_To[0] - 1].appendChild(redQueen)
            redQueen.addEventListener('click', pressPiece, false)
        } else {
            const blackQueen = document.createElement('span')
            blackQueen.className = "blackQ-piece wood-piece"
            woodBlocks[piece_Move_To[0] - 1].appendChild(blackQueen)
            blackQueen.addEventListener('click', pressPiece, false)
        }
    }
    declareToEmptyArray(piece_Move_From)
    declareToEmptyArray(piece_Move_To)

    ChangeTurn()
    isMyTurn = !isMyTurn

    // socket.emit("playerMakeIsMove", ({ thisRoom, GamePieceArray }))
    for (let i = 0; i < MoveHighlight.length; i++) {
        MoveHighlight[i].style.backgroundColor = "#BA7A3A"
        // console.log(MoveHighlight[i])
    }
    MoveHighlight = []
    declareToNull(pieceWhoMoveFirst)
    GameWon()

    possibleMoveTrueOrFales(false)
    //possibleMoveBefore = false;
    if (highLightedBlock.length > 0) {
        for (let x = 0; x < highLightedBlock.length; x++) { highLightedBlock[x].style.backgroundColor = "#BA7A3A" }
    }
    declareToEmptyArray(highLightedBlock)
    //highLightedBlock = []
    redTurnText.style.color = firstPlayerTurn ? "black" : "lightgray"
    blackTurnText.style.color = firstPlayerTurn ? "lightgray" : "black"
    validMoveTrueOrFales(false)
    Checking_For_Legal_Move(true, 0, woodBlocks)
    if (found_possible_Eating_Move) {
        possibleMoveTrueOrFales(true)
        //possibleMoveBefore = true
        console.log("found before eating move")
        console.log("=====================")
        console.log("highlighted boxes: ")
        for (let x = 0; x < highLightedBlock.length; x++) {
            console.log(highLightedBlock[x].id);
            highLightedBlock[x].style.backgroundColor = "#A9A9A9"
        }
        console.log("=====================")
    }
    return
}


export function pressPiece(piece) {
    let errorMessage2 = document.createElement("h2")
    if (!isMyTurn) {
        errorMessage2.id = "error-Message"
        errorMessage.appendChild(errorMessage2)
        errorMessage2.innerHTML = "Not your Turn"
        return
    }
    let thePiece = piece.target
    console.log(thePiece.parentNode.id)

    if (!thePiece.parentNode.id) { return }

    let CurrentPlayerArray = woodBlocks[thePiece.parentNode.id - 1].childNodes[0].classList[0]

    if ((firstPlayerTurn && (CurrentPlayerArray != "red-piece" && CurrentPlayerArray != "redQ-piece")) || (!firstPlayerTurn && (CurrentPlayerArray != "black-piece" && CurrentPlayerArray != "blackQ-piece"))) {
        errorMessage2.id = "error-Message"
        errorMessage.appendChild(errorMessage2)
        errorMessage2.innerHTML = "Not your piece"
        return
    }

    if (piece_Move_From[0] != undefined) {
        if (piece_Move_From[0] = undefined) { console.log("undefined!!!") }
        if (piece_Move_From[0] == thePiece.parentNode.id) {
            thePiece.style.border = "1px solid white"
            piece_Move_From = []
            console.log("already pressd")
            console.log(piece_Move_From[0])
            return
        }
        thePiece.style.border = "2px solid white"
        // TheMovedPiece.style.border = "1px solid white"
        declareMovedPiece(thePiece)
        WherePieceCanGo(thePiece.parentNode.id)
        thePiece.style.border = "2px solid green"
        // TheMovedPiece.style.border = "2px solid green"
        piece_Move_From[0] = thePiece.parentNode.id
    }
    else {
        declareMovedPiece(thePiece)
        WherePieceCanGo(thePiece.parentNode.id)
        thePiece.style.border = "2px solid green"
        // TheMovedPiece.style.border = "2px solid green"
        piece_Move_From[0] = thePiece.parentNode.id
    }
    console.log("piece move from id: " + piece_Move_From[0])
}

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

function GameWon() {
    if (redPieces.length == 0) {
        modalTitle.innerText = TheSecondPlayer[0].username + " Won"
        modal.classList.add("open");
        backdrop.style.display = 'block'
        backdrop.classList.add("open");
        if (userId == thisRoom) {
            socket.emit("gameWon", ({ won: TheSecondPlayer, lose: ThefirstPlayer, id: mongoId }))
        }

    }
    if (blackPieces.length == 0) {
        modalTitle.innerText = ThefirstPlayer[0].username + " Won"
        modal.classList.add("open");
        backdrop.style.display = 'block'
        backdrop.classList.add("open");
        if (userId !== thisRoom) {
            socket.emit("gameWon", ({ won: ThefirstPlayer, lose: TheSecondPlayer, id: mongoId }))
        }

    }
}
function WherePieceCanGo(pieceId) {
    for (let i = 0; i < MoveHighlight.length; i++) {
        MoveHighlight[i].style.backgroundColor = "#BA7A3A"
        console.log(MoveHighlight[i])
    }
    let skipNormalMove = false
    MoveHighlight = []
    if (highLightedBlock.length > 0) { return }
    let pieceIdNum = parseInt(pieceId)
    let index = 1
    if (GamePieceArray[pieceIdNum - 1] == " RQ " || GamePieceArray[pieceIdNum - 1] == " BQ ") {
        console.log("highlight QUEEN")
        skipNormalMove = true
        while ((GamePieceArray[pieceIdNum + (6 * index) + (index - 1)] == " = ") && (Column_Of_Piece(pieceIdNum + 7) < Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) < Row_Of_Piece(pieceIdNum + 7)) && index < 8) {
            MoveHighlight.push(woodBlocks[pieceIdNum + (6 * index) + (index - 1)])
            console.log("enter while:", index)
            MoveHighlight.push(woodBlocks[pieceIdNum + (6 * index) + (index - 1)])
            index++
        }
        index = 1
        while (GamePieceArray[pieceIdNum + (8 * index) + (index - 1)] == " = " && (Column_Of_Piece(pieceIdNum + (9 * index) + (index - index)) > Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) < Row_Of_Piece(pieceIdNum + (9 * index) + (index - 1)) && index < 8)) {
            console.log(Column_Of_Piece(pieceIdNum + (9 * index) + (index - index)))
            MoveHighlight.push(woodBlocks[pieceIdNum + (8 * index) + (index - 1)])
            console.log("enter while:", index)
            index++
        }
        index = 1
        while ((GamePieceArray[pieceIdNum - (10 * index) + (index - 1)] == " = ") && (Column_Of_Piece(pieceIdNum - (9 * index) + (index - index)) < Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) > Row_Of_Piece(pieceIdNum - 10)) && index < 8) {
            MoveHighlight.push(woodBlocks[pieceIdNum - (10 * index) + (index - 1)])
            console.log("enter while:", index)
            MoveHighlight.push(woodBlocks[pieceIdNum - (10 * index) + (index - 1)])
            index++
        }
        index = 1
        while ((GamePieceArray[pieceIdNum - (8 * index) + (index - 1)] == " = ") && (Column_Of_Piece(pieceIdNum - (7 * index) + (index - index)) > Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) > Row_Of_Piece(pieceIdNum - (7 * index) + (index - index))) && index < 8) {
            MoveHighlight.push(woodBlocks[pieceIdNum - (8 * index) + (index - 1)])
            console.log("enter while:", index)
            MoveHighlight.push(woodBlocks[pieceIdNum - (8 * index) + (index - 1)])
            index++
        }
    }
    if (!skipNormalMove) {
        if ((GamePieceArray[pieceIdNum + 6] == " = ") && (Column_Of_Piece(pieceIdNum + 7) < Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) < Row_Of_Piece(pieceIdNum + 7)))
            MoveHighlight.push(woodBlocks[pieceIdNum + 6])

        if (GamePieceArray[pieceIdNum + 8] == " = " && (Column_Of_Piece(pieceIdNum + 9) > Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) < Row_Of_Piece(pieceIdNum + 9)))
            MoveHighlight.push(woodBlocks[pieceIdNum + 8])

        if (GamePieceArray[pieceIdNum - 10] == " = " && (Column_Of_Piece(pieceIdNum - 10) < Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) > Row_Of_Piece(pieceIdNum - 10)))
            MoveHighlight.push(woodBlocks[pieceIdNum - 10])

        if (GamePieceArray[pieceIdNum - 8] == " = " && (Column_Of_Piece(pieceIdNum - 7) > Column_Of_Piece(pieceIdNum)) && (Row_Of_Piece(pieceIdNum) > Row_Of_Piece(pieceIdNum - 10)))
            MoveHighlight.push(woodBlocks[pieceIdNum - 8])
    }
    for (let i = 0; i < MoveHighlight.length; i++) {
        MoveHighlight[i].style.backgroundColor = "#a2570b"
        //console.log(MoveHighlight[i])
    }

}
addingEvent(woodBlocks)


