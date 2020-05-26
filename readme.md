### Iniciar proyecto

```
npm install
docker pull redis
docker run --name rd --publish 6379:6379 --detach redis
PORT=6379 npm start
```

### EndPoints
Un jugador crea una partida
```
curl -X POST -d "username=Sofia" localhost:3000/games
```

Ahora un jugador se quiere unir a una partida
```
curl -X PUT -d "username=Pamela" localhost:3000/games/3
```
Luego el primer jugador quiere hacer un movimiento en el board
```
curl -X PUT -d "username=Sofia&move=90" localhost:3000/games/3/board
```
Obtener el board de una partida en curso
```
curl -X GET localhost:3000/games/4/board
```
Obtener el status de una partida en curso
```
curl -X GET localhost:3000/games/4
```