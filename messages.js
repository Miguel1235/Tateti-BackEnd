const infoUsers = {
  msg1: "Client created successfully",
  msg2: "Client fetched successfully"
};

const errorsUsers = {
  err1: "The username wasn't provided",
  err2: "The username is already taken, please try another",
  err3: "The username with the provided hash doesn't exist",
};

const infoGames = {
  msg1: "Game create successfully",
  msg3: "Player successfully joined to the match",
  msg4: "Player successfully make the move",
  msg5: "Games currently playing",
  msg6: "Board successfully fetched",
  msg7: "Game successfully fetched",
  msg8: "Cannot join the game with the same name of the player 1",
  msg9: "draw",
  msg10: "win",
  msg11: "Game successfully deleted",
};

const errorsGames = {
  err1: "The username of the host player wasn't provided", // 4
  err2: "Cannot create the game because there is a problem with the database",
  err3: "Cannot add the player because the game doesn't exist",
  err4: "The game provided already has a a player",
  err6: "Cannot get the board because the game doesn't exist",
  err9: "The move wasn't provided or its greater then 8",
  err10: "Cannot make the move because the game doesn't exist or its finished",
  err11: "The move must be a number between 0 and 8",
  err12: "Cannot make the move because it isn't the turn of the player",
  err13: "The selected move has been already made, please choose another",
  err14: "Cannot get the game status because the game doesn't exist",
  err15: "Cannot delete the selected game",
  err16: "Cannot get the games because there is a problem with the database",
  err17: "These is a problem with the database",
};

const status = {
  sts1: "SUCCESS",
  sts2: "OK",
  sts3: "FAILED"
};

module.exports = { infoGames,
                   infoUsers,
                   errorsGames,
                   errorsUsers,
                   status };
