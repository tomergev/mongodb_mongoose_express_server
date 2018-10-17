const router = require('express').Router();
const chainController = require('../controllers/chains');
const blockController = require('../controllers/blocks');
const accountController = require('../controllers/accounts');
const { getUserFromJwtToken } = require('../controllers/users');

router.route('/')
  .post(
    chainController.create,
    getUserFromJwtToken,
    blockController.startBlockListener,
    accountController.createAllAccounts,
  );

module.exports = router;
