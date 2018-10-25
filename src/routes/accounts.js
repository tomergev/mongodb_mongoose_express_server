const router = require('express').Router();
const accountController = require('../controllers/accounts');

router.route('/')
  .get(accountController.get);

router.route('/:address')
  .get(accountController.getAccount);

router.route('/create/all')
  .post(accountController.createAllAccounts);

module.exports = router;
