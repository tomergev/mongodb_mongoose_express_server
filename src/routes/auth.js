const router = require('express').Router();
const authController = require('../controllers/auth');
const userController = require('../controllers/users');

router.route('/signup')
  .post(authController.signUp, userController.create);

router.route('/login')
  .post(authController.login);

module.exports = router;
