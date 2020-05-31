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
Un jugador quiere obtener info de su cuenta
```
curl -X GET localhost:3000/users/ae978aa10c628b27427ff2615ad925abdf4171fc7b4d1f7067bd35b23960d371
```
Un jugador crea una partida
```
curl -X POST -d "username=Jose" -H "hash:ae978aa10c628b27427ff2615ad925abdf4171fc7b4d1f7067bd35b23960d371" localhost:3000/games
```
Ahora un jugador se quiere unir a una partida
```
curl -X PUT -d "username=Pamela" -H "hash:8c87e5c7e7216b07c10ec0b49dd15eaba0bb91b8421c30123a8dd19d2b463fac" localhost:3000/games/6
```

Luego el primer jugador quiere hacer un movimiento en el board
```
curl -X POST -d "username=Jose&move=1" -H "hash:"ae978aa10c628b27427ff2615ad925abdf4171fc7b4d1f7067bd35b23960d371" localhost:3000/games/6/board
```
Obtener el board de una partida en curso
```
curl -X GET localhost:3000/games/4/board
```
Obtener el status de una partida en curso
```
curl -X GET localhost:3000/games/4
```
Borrar una partida
```
curl -X DELETE localhost:3000/games/4
```