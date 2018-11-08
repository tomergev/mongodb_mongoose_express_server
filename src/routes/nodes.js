const router = require('express').Router();
const nodeController = require('../controllers/nodes');

router.route('/')
  .get(nodeController.get);

module.exports = router;
