const router = require('express').Router();
// const { getUserFromJwtToken } = require('../controllers/users');
const transactionController = require('../controllers/transactions');

// router.use(getUserFromJwtToken);

router.route('/')
  .get(transactionController.get)
  .post(
    transactionController.checkIfTransactionsInProgress,
    transactionController.createTransactionSeries,
  )
  .delete(transactionController.stop);

router.get('/series', transactionController.getTransactionSeries);
router.get('/:hash', transactionController.getTransaction);

module.exports = router;
