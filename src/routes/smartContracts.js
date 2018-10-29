const router = require('express').Router();
const smartContractsController = require('../controllers/smartContracts');

router.route('/')
  .get(smartContractsController.get)
  .post(smartContractsController.deploy);

module.exports = router;
