const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../services/jwt/');

module.exports = {
  async getAll(req, res, next) {
    try {
      const users = await User.find();
      res.json({ users });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
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

      const user = await User.create(userInfo);
      const token = signToken(user);
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { userId } = req.params;
      await User.findByIdAndDelete(userId);
      res.json({ message: `User ${userId} has successfully been deleted` });
    } catch (err) {
      next(err);
    }
  },
};
