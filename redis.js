const express = require('express');
const redis = require('redis')

const crypto = require('crypto')

const {promisify} = require('util')

const client = redis.createClient({
  port: process.env.REDIS_PORT
})

const scan = promisify(client.scan).bind(client)

client.on('error', err => console.log(err))

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

const findGames=async ()=>
  new Promise(async (resolve,reject)=>{
    try{
      const games=await scanAll('game:*')
      resolve(games)
    }
    catch{
      reject(err)
    }
  })

const find= (key) => new Promise((resolve,reject)=>client.hgetall(key, (err, data) =>data?resolve(data):reject("Error")))

const findBoard=(gameId)=>new Promise((resolve,reject)=>client.lrange(`board:${gameId}`, 0, -1, (err, board)=>board.length>0?resolve(board):reject(err)))

const getGameId=()=>new Promise((resolve,reject)=>client.get('gameId',(err,data)=>data?resolve(data):reject(err)))
const incrGameId=()=>new Promise((resolve,reject)=>client.incr('gameId'))

const deleteGame = (gameId) => new Promise((resolve,reject)=>client.DEL(`game:${gameId}`, (err, reply) =>reply?resolve(reply):reject(err)))

const createClient=(username)=>new Promise((resolve,reject)=>{
  const hash = crypto.createHash('sha256').update(username).digest('hex')
  client.hset(`user:${hash}`,'username',username,(err,reply)=>reply===1?resolve(hash):reject(err))
})

const createGame=(gameId,username)=>
  new Promise((resolve,reject)=>{
    client.hmset(`game:${gameId}`, 'usernamePlayer1', username, 'usernamePlayer2', '', 'turnOf', username, 'status', 'waiting for the second player to join')
    client.lpush(`board:${gameId}`, '', '', '', '', '', '', '', '', '')
    resolve(gameId)
  })
const addPlayer=(gameId,username)=>
  new Promise((resolve,reject)=>{
    client.hset(`game:${gameId}`, 'usernamePlayer2', username, 'status', 'playing')
    resolve(1)
})
const checkMove=(gameId,move)=>
  new Promise((resolve,reject)=>{
    client.lindex(`board:${gameId}`,move,(err,square)=>resolve(square))
})
const placeMove=(gameId,move,username)=>
  new Promise((resolve,reject)=>{
    client.lset(`board:${gameId}`, move, username)
    resolve(1)
  })

const getBoard=(gameId)=>new Promise((resolve,reject)=>client.lrange(`board:${gameId}`, 0, -1,(err, reply)=>resolve(reply)))

const changeGameStatus=(gameId,status)=>
  new Promise(
    (resolve,reject)=>{
      client.hset(`game:${gameId}`, 'status',status)
      resolve(1)
    }
  )
const changeCurrentPlaying=(gameId,game)=>
  new Promise((resolve,reject)=>{
    client.hset(`game:${gameId}`, 'turnOf', game.turnOf === game.usernamePlayer1 ? game.turnOf = game.usernamePlayer2 : game.turnOf = game.usernamePlayer1)
    resolve(1)
  })


module.exports={find,findGames,findBoard,deleteGame,createClient,getGameId,createGame,incrGameId,addPlayer,checkMove,placeMove,getBoard,changeGameStatus,changeCurrentPlaying}