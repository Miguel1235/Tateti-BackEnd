const express = require('express');

const redis=require('redis')

const messages=require('../messages')
const commonResponse=require('../commonResponse')

const router = express.Router();


 const client=redis.createClient({
   port:6379
 })

client.on('error',err=>console.log(err))


 client.SETNX('userId',1)


 const {info,errors} = messages

 router.route('/')
   // curl - X POST - d "name=Tomas" localhost:3000/users
     // Crear un usuario
   .post((req,res)=>{
     if(req.body.username){
       client.GET('userId',(err,reply)=>{
           if(reply){
             client.HMSET(`user:${reply}`,'username',req.body.username,'win',0,'draw',0,'lost',0)
             client.INCR('userId')
             res.status(200).json(
               commonResponse('OK',info.msg1)
             )
           }
           else{
             res.status(400).json(
               commonResponse("FAILED",errors.err2)
             )
           }
         }
       )
     }
     else{
        res.status(400).json(
          commonResponse("FAILED",errors.err1)
        )
     }
   })



 router.route('/:userId')
   // curl - X GET localhost:3000/users/12
     // Obtener un usuario
   .get((req,res)=>{
     client.HGETALL(`user:${req.params.userId}`,(err,reply)=>{
       if(reply){
         res.status(200).json(
           {
             status:'SUCCESS',
             response:[
               reply
             ]
           }
         )
       }
       else{
           res.status(400).json(
             commonResponse("FAILED",errors.err3)
           )
       }
     })
   })

 module.exports = router;