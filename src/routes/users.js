const router = require('express').Router();
const userController = require('../controllers/users');

router.route('/')
  .get(userController.getAll);

module.exports = router;
