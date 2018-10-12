const router = require('express').Router();
const userController = require('../controllers/users');

router.route('/')
  .get(userController.getAll)
  .post(userController.post);

module.exports = router;
