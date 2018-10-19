const router = require('express').Router();
const { getUserFromJwtToken } = require('../controllers/users');
const transactionController = require('../controllers/transactions');

router.use(getUserFromJwtToken);

router.route('/')
  .get(transactionController.get)
  .post(transactionController.createTransactionSeries);

module.exports = router;
