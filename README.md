### Iniciar proyecto

```
npm install
docker-compose up
REDIS_PORT=6379 npm start
```

### EndPoints

Un jugador crea una cuenta
```
curl -X POST -d "username=Miguel" localhost:3000/users
```
#### HASH es el hash que se la dio al usuario al registrarse
Un jugador quiere obtener info de su cuenta
```
curl -X GET localhost:3000/users/HASH
```
Un jugador crea una partida
```
curl -X POST -d "username=Jose" -H "hash:HASH" localhost:3000/games
```
Ahora un jugador se quiere unir a una partida
```
curl -X PUT -d "username=Pamela" -H "hash:HASH" localhost:3000/games/23
```

Luego el jugador quiere hacer un movimiento en el board
```
curl -X POST -d "username=Jose&move=1" -H "hash:HASH" localhost:3000/games/23/board
```
Obtener el board de una partida
```
curl -X GET localhost:3000/games/23/board
```
Obtener el status de una partida en curso
```
curl -X GET localhost:3000/games/23
```
Borrar una partida
```
curl -X DELETE localhost:3000/games/23
```