const express = require('express')
const redis = require('redis')

const messages = require('../messages')

const commonResponse = require('../commonResponse')
const {
  infoGames,
  infoUsers,
  errorsGames,
  errorsUsers,
  status
} = messages


const router = express.Router()

const redisDb=require('../redis')

router.route('/')
  // Devuelve una lista con todos los juegos que estan en la base de datos
  .get(async (req, res) => {
    try{
      const games=await redisDb.findGames()
      res.status(200).json(commonResponse(status.sts1, infoGames.msg5,games))
    }
    catch{
      res.status(400).json(commonResponse(status.sts3, infoGames.msg16))
    }
  })

  // Creamos una partida
  .post(async (req, res) => {
    const {username} = req.body
    const {hash} = req.headers
    if (username) {
      try{
        const user=await redisDb.find(`user:${hash}`)
        if (user&&user.username === username){
            const gameId=await redisDb.getGameId()
            const game=await redisDb.createGame(gameId,username)
            await redisDb.incrGameId()
            res.status(200).json(commonResponse(status.sts2, infoGames.msg1, [game]))
        } else res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
      }
      catch(e){
        switch (e) {
          case "find failed":
            res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
            break
          case "getGameId failed":
            res.status(400).json(commonResponse(status.sts3, errorsGames.err2))
            break
          default:
            res.status(400).json(commonResponse(status.sts3,"WTF"))
            break
        }
      }
    } else res.status(400).json(commonResponse(status.sts3, errorsGames.err1))
  })

router.route('/:gameId/board')
  // Obtener el board de la partida  de una partida
  .get(async (req, res) => {
    const {gameId}=req.params
    try{
      const board=await redisDb.findBoard(gameId)
      res.status(200).json(commonResponse(status.sts1, infoGames.msg6, board))
    }
    catch{
      res.status(400).json(commonResponse(status.sts3, errorsGames.err6))
    }
  })

  .post(async (req, res) => {
    // El jugador hace un movimiento
    const {username,move} = req.body
    const {gameId} = req.params
    const {hash} = req.headers

    try{
      const user=await redisDb.find(`user:${hash}`)
      if (user && user.username === username) {
        if(move&&move<=8){
          const game=await redisDb.find(`game:${gameId}`)
          if (game && game.status === 'playing') {
            if (game.turnOf === username) {
              try{
                const square=await redisDb.checkMove(gameId,move)
                if (square.length === 0) { // ===0??????????
                  try{
                    await redisDb.placeMove(gameId,move,username)
                    const board=await redisDb.getBoard(gameId)
                    const checkFull = board.every(square => square.length > 0)
                    const checkWinner =
                      (board[0] === username && board[1] === username && board[2] === username) ||
                      (board[3] === username && board[4] === username && board[5] === username) ||
                      (board[6] === username && board[7] === username && board[8] === username) ||
                      (board[0] === username && board[3] === username && board[6] === username) ||
                      (board[1] === username && board[4] === username && board[7] === username) ||
                      (board[2] === username && board[5] === username && board[8] === username) ||
                      (board[0] === username && board[4] === username && board[8] === username) ||
                      (board[2] === username && board[4] === username && board[6] === username)

                      if (checkFull) {
                        try{
                          await redisDb.changeGameStatus(gameId,infoGames.msg9)
                          res.status(200).json(commonResponse(status.sts1, infoGames.msg9, board))
                        }
                        catch{
                          res.status(400).json(commonResponse(status.sts3, errorsGames.err17))
                        }
                      }
                      if (checkWinner) {
                        try{
                          await redisDb.changeGameStatus(gameId,`The player ${username} wins`)
                          res.status(200).json(commonResponse(status.sts1, username + infoGames.msg10, board))
                        }
                        catch{
                          res.status(400).json(commonResponse(status.sts3, errorsGames.err17))
                        }
                      }
                      if (!checkWinner && !checkFull) {
                        res.status(200).json(commonResponse(status.sts1, infoGames.msg4, board))
                      }
                      try{
                        await redisDb.changeCurrentPlaying(gameId,game)
                      }
                      catch{
                        res.status(400).json(commonResponse(status.sts3, errorsGames.err17))
                      }
                  }
                  catch{
                    res.status(400).json(commonResponse(status.sts3, errorsGames.err17))
                  }
                } else res.status(400).json(commonResponse(status.sts3, errorsGames.err13))
              }
              catch{
                res.status(400).json(commonResponse(status.sts3, errorsGames.err17))
              }
            } else res.status(400).json(commonResponse(status.sts3, errorsGames.err12))
          } else res.status(400).json(commonResponse(status.sts3, errorsGames.err10))
        } else res.status(400).json(commonResponse(status.sts3, errorsGames.err9))
      } else res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
    }
    catch{
      res.status(400).json(commonResponse(status.sts3, errorsGames.err17))
    }
  })

router.route('/:gameId')
  // Obtener el status de una partida en curso
  .get(async (req, res) => {
    const {gameId} = req.params
    try{
      const game=await redisDb.find(`game:${gameId}`)
      res.status(200).json(commonResponse(status.sts1, infoGames.msg7, [game]))
    }
    catch{
      res.status(400).json(commonResponse(status.sts3, errorsGames.err14))
    }
  })

  .put(
  // El jugador 2 se una a una partida
    async (req, res) => {
      const {gameId} = req.params
      const {username} = req.body
      const {hash} = req.headers

      if (username) {
        try{
          const user=await redisDb.find(`user:${hash}`)
          if (user && user.username === username) {
            try{
              const game=await redisDb.find(`game:${gameId}`)
              if (game.usernamePlayer2.length === 0) {
                if (game.usernamePlayer1 !== username) {
                  try{
                    await redisDb.addPlayer(gameId,username)
                    res.status(200).json(commonResponse(status.sts2, infoGames.msg3))
                  }
                  catch{
                    res.status(400).json(commonResponse(status.sts3, errorsGames.err17))
                  }
                } else res.status(400).json(commonResponse(status.sts3, infoGames.msg8))
              } else res.status(400).json(commonResponse(status.sts3, errorsGames.err4))
            }
            catch{
              res.status(400).json(commonResponse(status.sts3, errorsGames.err3))
            }
          } else res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
        }
        catch{
          res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
        }
      } else res.status(400).json(commonResponse(status.sts3, errorsUsers.err1))
    }
  )

  .delete(async (req, res) => {
    const {gameId} = req.params
    try{
      await redisDb.deleteGame(gameId)
      res.status(200).json(commonResponse(status.sts2, infoGames.msg11))
    }
    catch{
      res.status(400).json(commonResponse(status.sts3, errorsGames.err15))
    }
  })
module.exports = router