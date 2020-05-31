const express = require('express')
const redis = require('redis')

const {
  promisify
} = require('util')
const messages = require('../messages')

const commonResponse = require('../commonResponse')
const {
  infoGames,
  infoUsers,
  errorsGames,
  errorsUsers,
  status
} = messages


const client = redis.createClient({
  port: process.env.REDIS_PORT
})

const router = express.Router()
client.on('error', err => console.log(err))

const scan = promisify(client.scan).bind(client)

client.setnx('gameId', 1)

const scanAll = async (pattern) => {
  const found = [];
  let cursor = '0';
  do {
    const reply = await scan(cursor, 'MATCH', pattern);
    cursor = reply[0];
    found.push(...reply[1]);
  } while (cursor !== '0');
  return found;
}

router.route('/')
  // Devuelve una lista con todos los juegos que estan en la base de datos
  .get((req, res) => {
    scanAll('game:*').then(data => {
      res.status(200).json(commonResponse(status.sts1, infoGames.msg5, data))
    })
  })

  // Creamos una partida
  .post((req, res) => {
    const {
      username
    } = req.body
    const {
      hash
    } = req.headers
    if (username) {
      client.hgetall(`user:${hash}`, (err, user) => {
        if (user&&user.username === username) {

          client.GET('gameId', (err, gameId) => {
            if (gameId) {
              client.hmset(`game:${gameId}`, 'usernamePlayer1', username, 'usernamePlayer2', '', 'turnOf', username, 'status', 'waiting for the second player to join')
              client.lpush(`board:${gameId}`, '', '', '', '', '', '', '', '', '')
              res.status(200).json(commonResponse(status.sts2, infoGames.msg1, [gameId]))
              client.incr('gameId')
            } else res.status(400).json(commonResponse(status.sts3, errorsGames.err2))
          })

        } else res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
      })
    } else res.status(400).json(commonResponse(status.sts3, errorsGames.err1))
  })

router.route('/:gameId/board')
  // Obtener el board de la partida  de una partida
  .get((req, res) => {
    client.lrange(`board:${req.params.gameId}`, 0, -1, (err, board) => {
      if (board.length > 0) res.status(200).json(commonResponse(status.sts1, infoGames.msg6, board))
      else res.status(400).json(commonResponse(status.sts3, errorsGames.err6))
    })
  })

  .post((req, res) => {
    const {
      username,
      move
    } = req.body
    const {
      gameId
    } = req.params
    const {
      hash
    } = req.headers
    client.hgetall(`user:${hash}`, (err, user) => {
      if (user&&user.username === username) {

        if (move) {
          if (move <= 8) {
            client.hgetall(`game:${gameId}`, (err, game) => {
              if (game && game.status === 'playing') {
                // reply tiene los nombres de los jugadores y a quien le toca
                if (game.turnOf === username) {
                  // Se puede hacer el movimiento
                  client.lindex(`board:${gameId}`, move, (err, square) => {
                    if (square.length === 0) {
                      client.lset(`board:${gameId}`, move, username)
                      client.lrange(`board:${gameId}`, 0, -1, (err, reply) => {
                        const checkFull = reply.every(square => square.length > 0)
                        const checkWinner =
                          (reply[0] === username && reply[1] === username && reply[2] === username) ||
                          (reply[3] === username && reply[4] === username && reply[5] === username) ||
                          (reply[6] === username && reply[7] === username && reply[8] === username) ||
                          (reply[0] === username && reply[3] === username && reply[6] === username) ||
                          (reply[1] === username && reply[4] === username && reply[7] === username) ||
                          (reply[2] === username && reply[5] === username && reply[8] === username) ||
                          (reply[0] === username && reply[4] === username && reply[8] === username) ||
                          (reply[2] === username && reply[4] === username && reply[6] === username)
                        if (checkFull) {
                          res.status(200).json(commonResponse(status.sts1, infoGames.msg9, reply))
                          client.hset(`game:${gameId}`, 'status', infoGames.msg9)
                        }
                        if (checkWinner) {
                          res.status(200).json(commonResponse(status.sts1, username + infoGames.msg10, reply))
                          client.hset(`game:${gameId}`, 'status', `The player ${username} wins`)
                        }
                        if (!checkWinner && !checkFull) {
                          res.status(200).json(commonResponse(status.sts1, infoGames.msg4, reply))
                        }
                      })
                      // Cambiamos el turno
                      client.hset(`game:${gameId}`, 'turnOf', game.turnOf === game.usernamePlayer1 ? game.turnOf = game.usernamePlayer2 : game.turnOf = game.usernamePlayer1)
                    } else res.status(400).json(commonResponse(status.sts3, errorsGames.err13))
                  })
                } else res.status(400).json(commonResponse(status.sts3, errorsGames.err12))
              } else res.status(400).json(commonResponse(status.sts3, errorsGames.err10))
            })
          } else res.status(400).json(commonResponse(status.sts3, errorsGames.err11))
        } else res.status(400).json(commonResponse(status.sts3, errorsGames.err9))
      } else res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
    })
  })

router.route('/:gameId')
  // Obtener el status de una partida en curso
  .get((req, res) => {
    const {
      gameId
    } = req.params
    client.hgetall(`game:${gameId}`, (err, data) => {
      if (data) {
        res.status(200).json(commonResponse(status.sts1, infoGames.msg7, [data]))
      } else {
        res.status(400).json(commonResponse(status.sts3, errorsGames.err14))
      }
    })
  })

  // El jugador 2 se una a una partida
  .put(
    (req, res) => {
      const {
        gameId
      } = req.params
      const {
        username
      } = req.body
      const {
        hash
      } = req.headers

      if (username) {

        client.hgetall(`user:${hash}`, (err, user) => {
          if (user && user.username === username) {
            client.hgetall(`game:${gameId}`, (err, game) => {
              if (game) {
                if (game.usernamePlayer2.length === 0) {
                  if (game.usernamePlayer1 !== username) {
                    client.hset(`game:${gameId}`, 'usernamePlayer2', username, 'status', 'playing')
                    res.status(200).json(commonResponse(status.sts2, infoGames.msg3))
                  } else res.status(400).json(commonResponse(status.sts3, infoGames.msg8))
                } else res.status(400).json(commonResponse(status.sts3, errorsGames.err4))
              } else res.status(400).json(commonResponse(status.sts3, errorsGames.err3))
            })
          } else res.status(400).json(commonResponse(status.sts3, errorsUsers.err3))
        })
      } else res.status(400).json(commonResponse(status.sts3, errorsGames.err1))
    }
  )

  .delete((req, res) => {
    const {
      gameId
    } = req.params
    client.DEL(`game:${gameId}`, (err, reply) => {
      if (reply) res.status(200).json(commonResponse(status.sts2, infoGames.msg11))
      else res.status(400).json(commonResponse(status.sts3, errorsGames.err15))
    })
  })

module.exports = router