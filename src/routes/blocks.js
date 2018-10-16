const router = require('express').Router();
const blockController = require('../controllers/blocks');

router.route('/')
  .get(blockController.get);

router.route('/listener')
  .post(blockController.startBlockListener);

module.exports = router;
