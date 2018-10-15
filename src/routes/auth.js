const router = require('express').Router();
const authController = require('../controllers/auth');
const userController = require('../controllers/users');

router.route('/signup')
  .post(authController.signUp, userController.post);

module.exports = router;
