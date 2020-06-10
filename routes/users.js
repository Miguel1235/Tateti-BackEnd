const express = require('express');
const messages = require('../messages');
const commonResponse = require('../commonResponse');

const router = express.Router();

const {
  infoUsers,
  errorsUsers,
  status
} = messages;

const redisDb = require('../redis');

router.route('/')
  // Crear un usuario
  .post(async (req, res) => {
    const {
      username
    } = req.body;
    if (username) {
      try {
        const newUser = await redisDb.createClient(username);
        res.status(200).json(commonResponse(status.sts1,
                                            infoUsers.msg1,
                                            [newUser]));
      } catch {
        res.status(400).json(commonResponse(status.sts3,
                                            errorsUsers.err2));
      }
    } else {
      res.status(400).json(commonResponse(status.sts3,
                                          errorsUsers.err1));
    }
  });

// Mmmm ojo el nombre hash, es muy generico, si estas pasando un
// identificador lo mejor seria userId, id
router.route('/:hash')
  // Obtener info de un cuenta
  .get(async (req, res) => {
    const {
      hash
    } = req.params;
    try {
      const user = await redisDb.find(`user:${hash}`);
      res.status(200).json(commonResponse(status.sts1,
                                          infoUsers.msg2,
                                          user));
    } catch {
      res.status(400).json(commonResponse(status.sts3,
                                          errorsUsers.err3));
    }
  });

module.exports = router;
