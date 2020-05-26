var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var gamesRouter = require('./routes/games');

var app = express();

const cors=require('cors')

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/games', gamesRouter);


module.exports = app;

// // Actualizar el board de una partida en curso, el jugador hace un movimiento
// curl - X PUT - d = "player=pepe&numberBoard=1" localhost: 3000 / games / 69 {
// 	status: "OK",
// 	response: [{
// 		"description": "Board succesfully updated"
// 	}]
// }
//
// // Borrar una partida
// curl - X DELETE localhost: 3000 / games / 29



//
// //archivo public/js/blabla
// function getLastClientId() {
// 	return new Promise(resolve => {
// 			clientId = 1;
// 			//consulta a redis que no anda
// 			redisClient.get('clientId', (err, result) => {
// 				if (result) {
// 					clientIdAux = parseInt(result);
// 					resolve(clientIdAux)
// 				} else {
// 					clientIdAux = 0
// 					resolve(clientIdAux);
// 				}
// 			});
// 		}
// 	};
// 	//archivo routes/cliente.js
// 	router.post('/', async function (req, res, next) {
//
// 		var clientId = await dbClients.getLastClientId();
// 		clienId++; //autoincrmento
// 		console.log("impreso en consola:"
// 			clientId)
// 		key = client# $ {
// 			clientId
// 		}
// 		value = JSON.stringify(req.body);
//
// 		redisClient.set(key, value, (err, result) => {
// 			if (result) {
// 				dbClients.setClientId(clientId);
// 				res.status(200);
// 				res.end(hlresponse(statusOK, create user$ {
// 					key
// 				}))
//
// 			} else {
// 				res.status(400)
// 				res.end(hlresponse(statusError, err));
// 			}
// 		});