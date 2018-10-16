const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../services/jwt/');

module.exports = {
  async signUp(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        throw new Error(`A user already exists with the email, ${email}. Please create a user with a different email or sign-in with this email`);
      }

      next();
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const {
        email,
        password,
      } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw new Error(`There is no user with this email, ${email}, please create a user with this email before attempting to login with these credentials`);
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        throw new Error('The password submitted is incorrect');
      }

      const token = signToken(user);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  },
};
