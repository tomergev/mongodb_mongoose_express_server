const router = require('express').Router();
const userController = require('../controllers/users');

router.route('/')
  .get(userController.getAll);

router.route('/:userId')
  .delete(userController.delete);

module.exports = router;
