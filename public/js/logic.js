const socket = io()

socket.on("opponentMadeIsMove", ({ opponent }) => {
    console.log(opponent)
})
import { pressPiece } from './ui.js'
import { pressWoodBlock } from './ui.js'
export let GamePieceArray = []
export let TheMovedPiece
export let piece_Move_From = []
export let piece_Move_To = []
export let firstPlayerTurn = true;
//export let isMyTurn=true;
export let validMove = false;
export let pieceWhoMoveFirst = null;
export let found_possible_Eating_Move = false
export let possibleMoveBefore = false
export let highLightedBlock = [];
let Checking_For_possible_Eating_Move = false
let skipedEating = false
let piecesWhoCanEat = []
let queenTarget = [];


export function FillGameBoardArray(woodblock) {
    GamePieceArray = []
    for (let i = 0; i < 64; i++) {
        if (woodblock[i].childNodes[0] != undefined) {
            if (woodblock[i].childNodes[0].classList[0] === "red-piece")
                GamePieceArray.push(" R ")
            if (woodblock[i].childNodes[0].classList[0] === "redQ-piece")
                GamePieceArray.push(" RQ ")
            if (woodblock[i].childNodes[0].classList[0] === "black-piece")
                GamePieceArray.push(" B ")
            if (woodblock[i].childNodes[0].classList[0] === "blackQ-piece")
                GamePieceArray.push(" BQ ")
        }
        else {
            GamePieceArray.push(" = ")
        }
    }
    let row = '';
    let count = 1
    for (let j = 0; j < 64; j++, count++) {
        row += GamePieceArray[j]
        if (count % 8 == 0) {
            console.log(row)
            row = ''
        }
    }
}

export function addingEvent(woodBlocks) {
    for (let i = 0; i < woodBlocks.length; i++) {
        woodBlocks[i].addEventListener('click', pressWoodBlock, false)
        if (woodBlocks[i].childNodes[0]) {
            woodBlocks[i].addEventListener('click', pressPiece, false)
        }
    }
}

export function DoesThePieceIsQueen(pieceId) {
    if (GamePieceArray[pieceId - 1] == " RQ " || GamePieceArray[pieceId - 1] == " BQ ")
        return true
    else { return false }
}

export function ChangeTurn() {
    firstPlayerTurn = !firstPlayerTurn;
}

export function test(woodblock) {
    console.log(pressWoodBlock(woodblock - 1))
}

export function declareMovedPiece(thePiece) {
    TheMovedPiece = thePiece
}
export function declarePieceMoveTo(woodblock) {
    piece_Move_To[0] = woodblock
}
export function declareToNull(whatDeclareToNull) {
    whatDeclareToNull = null
}
export function declareToUndefined(whatDeclareToUndefined) {
    whatDeclareToUndefined = undefined;
}
export function declareToEmptyArray(whatDeclareToEmptyArray) {
    whatDeclareToEmptyArray = [];
}
export function declareToFalesOrTrue(whatToDeclare, ToTrue) {
    whatToDeclare = ToTrue
}
export function validMoveTrueOrFales(value) {
    validMove = value;
}
export function possibleMoveTrueOrFales(value) {
    possibleMoveBefore = value
}


export function CheckPreMove() {

    if (pieceWhoMoveFirst == null) {
        pieceWhoMoveFirst = piece_Move_To[0]
        console.log("piece who satrt is at " + pieceWhoMoveFirst)
    } else if (pieceWhoMoveFirst != null) {
        if (piece_Move_From[0] != pieceWhoMoveFirst) {
            console.log("diffret piece move")
            return
        } else {
            pieceWhoMoveFirst = piece_Move_To[0]
            console.log("piece who satrt is NOW at " + pieceWhoMoveFirst)
        }
    }
}

export function Column_Of_Piece(pieceId) {
    let numberToCheck;
    if (pieceId % 8 == 0) {
        numberToCheck = 8
        return numberToCheck
    }
    numberToCheck = (pieceId + 8) - (8 * (1 + Math.floor(pieceId / 8)))
    return numberToCheck
}

export function Row_Of_Piece(pieceId) {
    let numberToCheck;
    if (pieceId % 8 == 0) {
        numberToCheck = pieceId / 8
        return numberToCheck;
    }
    numberToCheck = (Math.floor(pieceId / 8) + 1)
    return numberToCheck;
}


export function CheckForSkipEatingMove(moveFromNum) {
    if (highLightedBlock.length > 0) {
        let countWrong = 0;
        for (let i = 0; i < highLightedBlock.length; i++) {
            if (highLightedBlock[i].id != piece_Move_To[0]) { countWrong++ }
        }
        if (countWrong == highLightedBlock.length) {
            return false
        }
    }
    console.log("move to: " + piece_Move_To[0])
    if (piecesWhoCanEat.length > 0) {
        let countwrong = 0
        for (let i = 0; i < piecesWhoCanEat.length; i++) {
            if (moveFromNum != (piecesWhoCanEat[i] + 1)) { countwrong++ }
        }
        if (countwrong == piecesWhoCanEat.length) {
            return false
        }
    }
    return true
}


export function sendToMovesFunction(the_Piece_Is_Queen, moveToNum, moveFromNum, woodBlocks) {
    if (!the_Piece_Is_Queen) {
        switch ((moveToNum - moveFromNum)) {
            case 9: Is_Legal_Move(); break;
            case -9: Is_Legal_Move(); break;
            case 7: Is_Legal_Move(); break;
            case -7: Is_Legal_Move(); break;
            default: Is_Legal_Eating_Move(moveFromNum, moveToNum, woodBlocks); break;
        }
    } else {
        if (queenTarget.includes(moveToNum)) {
            console.log("enter queen eating function")
            Is_Legal_Queen_Eating_Move(moveFromNum, moveToNum, woodBlocks)
        }
        else {
            console.log("enter normal queen  moving function")
            console.log(moveToNum + " " + queenTarget)
            Is_Quenn_Move_Legal();
        }
    }
}

export function Checking_For_Legal_Move(checkEveryMove, pieceToCheck, woodBlocks) {
    let SymbolOfPlayer = firstPlayerTurn ? " R " : " B "
    let QueenSymbol = firstPlayerTurn ? " RQ " : " BQ "
    let NumOfPossibleEatingMoves = 0
    Checking_For_possible_Eating_Move = true;
    found_possible_Eating_Move = false
    highLightedBlock = []
    piecesWhoCanEat = []
    if (checkEveryMove) {
        for (let i = 0; i < 64; i++) {
            if (GamePieceArray[i] == SymbolOfPlayer || GamePieceArray[i] == QueenSymbol) {
                for (let j = 0; j < 64; j++) {
                    if (GamePieceArray[i] == QueenSymbol) {
                        Is_Legal_Queen_Eating_Move(i + 1, j + 1, woodBlocks)
                    } else {
                        Is_Legal_Eating_Move(i + 1, j + 1, woodBlocks)
                    }
                    if (found_possible_Eating_Move) {
                        if (!highLightedBlock.includes(woodBlocks[j])) {
                            NumOfPossibleEatingMoves++
                            console.log("found possible eating move: " + (i + 1) + " " + (j + 1))
                            piecesWhoCanEat.push(i)
                            highLightedBlock.push(woodBlocks[j])
                            found_possible_Eating_Move = false
                            validMove = false
                        } else {
                            console.log("You have to eat the piece")
                            skipedEating = true;
                            found_possible_Eating_Move = false
                            validMove = false
                        }
                    }
                }
            }
        }
    } else {
        let i = pieceToCheck
        for (let j = 0; j < 64; j++) {
            if (GamePieceArray[i] == QueenSymbol) {
                Is_Legal_Queen_Eating_Move(i + 1, j + 1, woodBlocks)
            } else {
                Is_Legal_Eating_Move(i + 1, j + 1, woodBlocks)
            }
            if (found_possible_Eating_Move) {
                if (!highLightedBlock.includes(woodBlocks[j])) {
                    NumOfPossibleEatingMoves++
                    console.log("found possible eating move: " + (i + 1) + " " + (j + 1))
                    piecesWhoCanEat.push(i)
                    highLightedBlock.push(woodBlocks[j])
                    found_possible_Eating_Move = false
                    validMove = false
                } else {
                    console.log("You have to eat the piece")
                    skipedEating = true;
                    found_possible_Eating_Move = false
                    validMove = false
                }
            }
        }
    }
    if (NumOfPossibleEatingMoves > 0)
        found_possible_Eating_Move = true
    Checking_For_possible_Eating_Move = false
}

export function CheckIfPieceTurnToQueen() {
    if (firstPlayerTurn) {
        if (Row_Of_Piece(piece_Move_To[0]) == 8) {
            return true;
        }
    } else {
        if (Row_Of_Piece(piece_Move_To[0]) == 1) {
            return true;
        }
    }
    return false;
}


function Is_Legal_Move() {
    let PieceToNum = parseInt(piece_Move_To[0])
    let PieceFromNum = parseInt(piece_Move_From[0])

    if (Row_Of_Piece(parseInt(piece_Move_To[0])) == Row_Of_Piece(parseInt(piece_Move_From[0]))) { return }

    if (firstPlayerTurn) {
        if (PieceToNum > PieceFromNum) {//diagonal down
            if ((PieceToNum - PieceFromNum) == 9 || (PieceToNum - PieceFromNum) == 7) { validMove = true }
        }
        else {//diagonal up
            if ((PieceToNum - PieceFromNum) == -9 || (PieceToNum - PieceFromNum) == -7) { validMove = true }
        }
    } else {
        if (PieceToNum < PieceFromNum) {
            if ((PieceFromNum - PieceToNum) == 9 || (PieceFromNum - PieceToNum) == 7) { validMove = true }
        }
        else {
            if ((PieceFromNum - PieceToNum) == -9 || (PieceFromNum - PieceToNum) == -7) { validMove = true }
        }
    }
}


function Is_Quenn_Move_Legal() {
    console.log("queen move from:" + piece_Move_From[0] + "\nto: " + piece_Move_To[0])
    let pieceMoveFromInt = parseInt(piece_Move_From[0])
    let pieceMoveToInt = parseInt(piece_Move_To[0])
    let directionOfMoving;
    for (let i = 0; i < 8; i++) {  //finding in what direction the queen search for opponents

        if ((pieceMoveFromInt + (9 * i)) == pieceMoveToInt) { //diagonal down right
            directionOfMoving = 1
            break;
        }
        if ((pieceMoveFromInt - (9 * i)) == pieceMoveToInt) { //diagonal up left
            directionOfMoving = 2
            break;
        }
        if ((pieceMoveFromInt + (7 * i)) == pieceMoveToInt) { //diagonal down left
            directionOfMoving = 3
            break;
        }
        if ((pieceMoveFromInt - (7 * i)) == pieceMoveToInt) { //diagonal up right
            directionOfMoving = 4
            break;
        }
    }
    switch (directionOfMoving) {
        case 1:
            for (let i = 1; i <= 8; i++) {
                if (GamePieceArray[(pieceMoveFromInt + (9 * i)) - 1] != " = ") {
                    break;
                }
                if ((pieceMoveFromInt + (9 * i)) == pieceMoveToInt) {
                    validMove = true;
                    break;
                }
            }
        case 2:
            for (let i = 1; i <= 8; i++) {
                if (GamePieceArray[(pieceMoveFromInt - (9 * i)) - 1] != " = ") {
                    break;
                }
                if ((pieceMoveFromInt - (9 * i)) == pieceMoveToInt) {
                    validMove = true;
                    break;
                }
            }
        case 3:
            for (let i = 1; i <= 8; i++) {
                if (GamePieceArray[(pieceMoveFromInt + (7 * i)) - 1] != " = ") {
                    break;
                }
                if ((pieceMoveFromInt + (7 * i)) == pieceMoveToInt) {
                    validMove = true;
                    break;
                }
            }
        case 4:
            for (let i = 1; i <= 8; i++) {
                if (GamePieceArray[(pieceMoveFromInt - (7 * i)) - 1] != " = ") {
                    break;
                }
                if ((pieceMoveFromInt - (7 * i)) == pieceMoveToInt) {
                    validMove = true;
                    break;
                }
            }
    }
}

function Is_Legal_Queen_Eating_Move(moveFromNum, moveToNum, woodBlocks) {
    let countOpsticle = 0
    let stepToTarget = 0
    let directionOfEating;
    let Symbol = firstPlayerTurn ? " R " : " B "
    let SymbolQueen = firstPlayerTurn ? " RQ " : " BQ "
    let countToTarget = 0
    for (let i = 0; i < 8; i++, countToTarget++) {  //finding in what direction the queen search for opponents

        if ((moveFromNum + (9 * i)) == moveToNum) { //diagonal down right
            directionOfEating = 1
            break;
        }
        if ((moveFromNum - (9 * i)) == moveToNum) { //diagonal up left
            directionOfEating = 2
            break;
        }
        if ((moveFromNum + (7 * i)) == moveToNum) { //diagonal down left
            directionOfEating = 3
            break;
        }
        if ((moveFromNum - (7 * i)) == moveToNum) { //diagonal up right
            directionOfEating = 4
            break;
        }
    }

    if (directionOfEating) {  //searching for opponent and if emepty space after opponent location
        switch (directionOfEating) {
            case 1: //work
                if (GamePieceArray[moveToNum - 1] != " = ") { break; }
                countOpsticle = 0
                if ((Column_Of_Piece(moveToNum) > Column_Of_Piece(moveFromNum))) {
                    for (let i = 1; i <= 8; i++) {
                        if ((moveFromNum + (9 * i)) != moveToNum) {
                            if (GamePieceArray[(moveFromNum + (9 * i)) - 1] !== " = ") {
                                console.log("the road is block to: " + moveToNum + " in step: " + i)
                                stepToTarget = i
                                countOpsticle++
                                console.log("count to target: " + countToTarget)
                                console.log("opponetn: " + GamePieceArray[moveToNum - 10])
                                if (GamePieceArray[(moveFromNum + (9 * i)) - 1] == Symbol || GamePieceArray[(moveFromNum + (9 * i)) - 1] == SymbolQueen) { break; }
                            }
                        }
                        if ((moveFromNum + (9 * i)) == moveToNum && countOpsticle == 1) {
                            if (Checking_For_possible_Eating_Move)
                                queenTarget.push(moveToNum)
                            validMove = true
                            console.log("valid for " + moveToNum + " is in the end")
                            console.log("opsticle count: " + countOpsticle)
                            break;
                        }
                        if ((moveFromNum + (9 * i)) == moveToNum) {
                            console.log("the road is free to: " + moveToNum)
                            break;
                        }
                    }
                }
                break;
            case 2:
                if (GamePieceArray[moveToNum - 1] != " = ") { break; }
                countOpsticle = 0
                if ((Column_Of_Piece(moveToNum) < Column_Of_Piece(moveFromNum))) {
                    for (let i = 1; i <= 8; i++) {
                        if ((moveFromNum - (9 * i)) != moveToNum) {
                            if (GamePieceArray[(moveFromNum - (9 * i)) - 1] != " = ") {
                                console.log("the road is block to: " + moveToNum + " in step: " + i)
                                stepToTarget = i
                                countOpsticle++
                                console.log("count to target: " + countToTarget)
                                console.log("opponetn: " + GamePieceArray[moveToNum + 8])
                                if (GamePieceArray[(moveFromNum - (9 * i)) - 1] == Symbol || GamePieceArray[(moveFromNum - (9 * i)) - 1] == SymbolQueen) {
                                    console.log("try to eat own piece")
                                    break;
                                }
                            }
                        }
                        if ((moveFromNum - (9 * i)) == moveToNum && countOpsticle == 1) {
                            if (Checking_For_possible_Eating_Move)
                                queenTarget.push(moveToNum)
                            validMove = true
                            console.log("valid for " + moveToNum + " is in the end")
                            console.log("opsticle count: " + countOpsticle)
                            break;
                        }
                        if ((moveFromNum - (9 * i)) == moveToNum) {
                            console.log("the road is free to: " + moveToNum)
                            break;
                        }
                    }
                }
                break;
            case 3: //work
                if (GamePieceArray[moveToNum - 1] != " = ") { break; }
                countOpsticle = 0
                if ((Column_Of_Piece(moveToNum) < Column_Of_Piece(moveFromNum))) {
                    for (let i = 1; i <= 8; i++) {
                        if ((moveFromNum + (7 * i)) != moveToNum) {
                            if (GamePieceArray[(moveFromNum + (7 * i)) - 1] != " = ") {
                                console.log("the road is block to: " + moveToNum + " in step: " + i)
                                stepToTarget = i
                                countOpsticle++
                                console.log("count to target: " + countToTarget)
                                console.log("opponetn: " + GamePieceArray[moveToNum - 8])
                                if (GamePieceArray[(moveFromNum + (7 * i)) - 1] == Symbol || GamePieceArray[(moveFromNum + (7 * i)) - 1] == SymbolQueen) {
                                    console.log("try to eat own piece")
                                    break;
                                }
                            }
                        }
                        if ((moveFromNum + (7 * i)) == moveToNum && countOpsticle == 1) {
                            if (Checking_For_possible_Eating_Move)
                                queenTarget.push(moveToNum)
                            validMove = true
                            console.log("valid for " + moveToNum + " is in the end")
                            console.log("opsticle count: " + countOpsticle)
                            break;
                        }
                        if ((moveFromNum + (7 * i)) == moveToNum && countOpsticle == 0) {
                            console.log("the road is free to: " + moveToNum)
                            break;
                        }
                    }
                }
                break;
            case 4:
                if (GamePieceArray[moveToNum - 1] != " = ") { break; }
                countOpsticle = 0
                if ((Column_Of_Piece(moveToNum) > Column_Of_Piece(moveFromNum))) {
                    for (let i = 1; i <= 8; i++) {
                        if ((moveFromNum - (7 * i)) != moveToNum) {
                            if (GamePieceArray[(moveFromNum - (7 * i)) - 1] != " = ") {
                                console.log("the road is block to: " + moveToNum + " in step: " + i)
                                stepToTarget = i
                                countOpsticle++
                                console.log("count to target: " + countToTarget)
                                console.log("opponetn: " + GamePieceArray[moveToNum + 6])
                                if (GamePieceArray[(moveFromNum - (7 * i)) - 1] == Symbol || GamePieceArray[(moveFromNum - (7 * i)) - 1] == SymbolQueen) {
                                    console.log("try to eat own piece")
                                    break;
                                }
                            }
                        }
                        if ((moveFromNum - (7 * i)) == moveToNum && countOpsticle == 1) {
                            if (Checking_For_possible_Eating_Move)
                                queenTarget.push(moveToNum)
                            validMove = true
                            console.log("valid for " + moveToNum + " is in the end")
                            console.log("opsticle count: " + countOpsticle)
                            break;
                        }
                        if ((moveFromNum - (7 * i)) == moveToNum) {
                            console.log("the road is free to: " + moveToNum)
                            break;
                        }
                    }
                }
                break;
        }
    }
    if (validMove && Checking_For_possible_Eating_Move) { found_possible_Eating_Move = true; }
    if (validMove && !Checking_For_possible_Eating_Move) {
        queenTarget = []
        console.log("eneter queen eating function")
        switch (directionOfEating) {
            case 1: {
                woodBlocks[moveFromNum + (9 * stepToTarget) - 1].childNodes[0].remove()
                break;
            }
            case 2: {
                woodBlocks[moveFromNum - (9 * stepToTarget) - 1].childNodes[0].remove()
                break;
            }
            case 3: {
                woodBlocks[moveFromNum + (7 * stepToTarget) - 1].childNodes[0].remove()
                break;
            }
            case 4: {
                woodBlocks[moveFromNum - (7 * stepToTarget) - 1].childNodes[0].remove()
                break;
            }
        }
    }
}

function Is_Legal_Eating_Move(moveFromNum, moveToNum, woodBlocks) {

    let Symbol = firstPlayerTurn ? " B " : " R "
    let SymbolQueen = firstPlayerTurn ? " BQ " : " RQ "
    let directionOfEating;

    switch ((moveToNum - moveFromNum) / 2) {
        case 9:
            if ((Column_Of_Piece(moveToNum - 9) != 8) && Row_Of_Piece(moveToNum - 9) != 8) {
                if ((GamePieceArray[(moveToNum - 10)] == Symbol || GamePieceArray[(moveToNum - 10)] == SymbolQueen) && (GamePieceArray[moveToNum - 1] == " = ")) { validMove = true; } directionOfEating = 1; break;
            } else { break; }
        case -9:
            if ((Column_Of_Piece(moveToNum + 9) != 1) && Row_Of_Piece(moveToNum + 9) != 1) {
                if ((GamePieceArray[(moveToNum + 8)] == Symbol || GamePieceArray[(moveToNum + 8)] == SymbolQueen) && (GamePieceArray[moveToNum - 1] == " = ")) { validMove = true; } directionOfEating = 2; break;
            } else { break; }
        case 7:
            if ((Column_Of_Piece(moveToNum - 7) != 1) && Row_Of_Piece(moveToNum - 7) != 8) {
                if ((GamePieceArray[(moveToNum - 8)] == Symbol || GamePieceArray[(moveToNum - 8)] == SymbolQueen) && (GamePieceArray[moveToNum - 1] == " = ")) { validMove = true }; directionOfEating = 3; break;
            } else { break; }
        case -7:
            if ((Column_Of_Piece(moveToNum + 7) != 8) && Row_Of_Piece(moveToNum + 7) != 1) {
                if ((GamePieceArray[(moveToNum + 6)] == Symbol || GamePieceArray[(moveToNum + 6)] == SymbolQueen) && (GamePieceArray[moveToNum - 1] == " = ")) { validMove = true }; directionOfEating = 4; break;
            } else { break; }
    }

    if (validMove && Checking_For_possible_Eating_Move) {
        found_possible_Eating_Move = true;
        return
    }
    if (validMove && !Checking_For_possible_Eating_Move) {
        switch (directionOfEating) {
            case 1: {
                woodBlocks[(moveToNum - 10)].childNodes[0].remove()
                break;
            }
            case 2: {
                woodBlocks[(moveToNum + 8)].childNodes[0].remove()
                break;
            }
            case 3: {
                woodBlocks[(moveToNum - 8)].childNodes[0].remove()
                break;
            }
            case 4: {
                woodBlocks[(moveToNum + 6)].childNodes[0].remove()
                break;
            }
        }
    }
}

