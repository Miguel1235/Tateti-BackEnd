const express = require('express');
const redis = require('redis')
const crypto = require('crypto')

const messages = require('../messages')
const commonResponse = require('../commonResponse')

const router = express.Router();

const client = redis.createClient({
  port: process.env.REDIS_PORT
})

client.on('error', err => console.log(err))

const {infoUsers,errorsUsers,status} = messages

router.route('/')
  .post((req, res) => {
    // Crear un usuario
    const {username} = req.body
    if (username) {
      const hash = crypto.createHash('sha256').update(username).digest('hex')
      client.hset(`user:${hash}`,'username',username,(err,reply)=>{
        if(reply===1){
          res.status(200).json(commonResponse(status.sts1,infoUsers.msg1,[hash]))
        }
        else res.status(400).json(commonResponse(status.sts3,errorsUsers.err2))
      })
    } else {
      res.status(400).json(commonResponse(status.sts3,errorsUsers.err1))
    }
  })

router.route('/:hash')
  // Obtener una cuenta
  .get((req, res) => {
    client.HGETALL(`user:${req.params.hash}`, (err, reply) => {
      if(reply) res.status(200).json(commonResponse(status.sts1,infoUsers.msg2,reply))
      else res.status(400).json(commonResponse(status.sts3,errorsUsers.err3))
    })
  })
module.exports = router;