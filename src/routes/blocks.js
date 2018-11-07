const router = require('express').Router();
const blockController = require('../controllers/blocks');
// const { getUserFromJwtToken } = require('../controllers/users');

// router.use(getUserFromJwtToken);

router.route('/')
  .get(blockController.get);

router.route('/:blockHash')
  .get(blockController.findOne);

router.route('/listener')
  .post(blockController.startBlockListener);

module.exports = router;
