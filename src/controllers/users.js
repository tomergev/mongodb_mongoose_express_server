const User = require('../models/User');

module.exports = {
  getAll(req, res) {
    try {
      // Passing an empty object to User's find method, get all instances of the user model
      User.find({}, (err, users) => {
        if (err) throw err;
        res.json({ users });
      });
    } catch (err) {
      res.status(400).send(err);
    }
  },

  async post(req, res) {
    try {
      const {
        email,
        password,
      } = req.body;

      const user = await new Promise((resolve, reject) => {
        User.create({ email, password }, (err, userRes) => {
          if (err) reject(err);
          resolve(userRes);
        });
      });

      res.json({ user });
    } catch (err) {
      res.status(400).send(err);
    }
  },

};
