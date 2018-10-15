const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/');
const User = require('../models/User');

module.exports = {
  getAll(req, res, next) {
    try {
      // Passing an empty object to User's find method, get all instances of the user model
      User.find({}, (err, users) => {
        if (err) throw err;
        res.json({ users });
      });
    } catch (err) {
      next(err);
    }
  },

  async post(req, res, next) {
    try {
      const {
        email,
        password,
      } = req.body;

      const passwordHash = bcrypt.hashSync(password, 8);
      const userInfo = {
        email,
        password: passwordHash,
      };

      const user = await new Promise((resolve, reject) => {
        User.create(userInfo, (err, userRes) => {
          if (err) reject(err);
          resolve(userRes);
        });
      });

      const token = jwt.sign({ id: user._id }, config.jwt.secret);

      res.json({
        user,
        token,
      });
    } catch (err) {
      next(err);
    }
  },

};
