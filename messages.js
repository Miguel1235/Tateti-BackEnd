const info={
  msg1:"Client created successfully",
  msg2:"Game create successfully",
  msg3:"Player successfully joined to the match",
  msg4:"Player successfully make the move",
  msg5:"Games currently playing",
  msg6:"Board successfully fetched",
  msg7:"Game succesfully fetched",
  msg8:"Cannot join the game with the same name of the player 1",
  msg9:"draw",
  msg10:"win",
}
const errors={
  err1:"The username wasn't provided",
  err2:"Cannot create client",
  err3:"The username with the provided id doesn't exist",
  err4:"The username of the host player wasn't provided",
  err5:"Cannot create the game",
  err6:"Cannot get the board because the game doesn't exist",
  err7:"Cannot add the player because the game doesn't exist",
  err8:"The game provided already has a a player",
  err9:"The username or move wasn't provided",
  err10:"Cannot make the move because the game doesn't exist or its finished",
  err11:"The move must be a number between 0 and 8",
  err12:"Cannot make the move because it isn't the turn of the player",
  err13:"The selected move has been already made, please choose another",
  err14:"Cannot get the game status because the game doesn't exist"
}
const status={
  sts1:"SUCCESS",
  sts2:"OK",
  sts3:"FAILED"
}

module.exports={info,errors,status}