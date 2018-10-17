const router = require('express').Router();
const accountController = require('../controllers/accounts');
const { getUserFromJwtToken } = require('../controllers/users');

router.use(getUserFromJwtToken);

router.route('/')
  .get(accountController.get);

router.route('/create/all')
  .post(accountController.createAllAccounts);

module.exports = router;
