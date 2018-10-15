const User = require('../models/User');

module.exports = {
  signUp(req, res, next) {
    try {
      const { email } = req.body;

      User.find({ email }, (err, users) => {
        if (err) throw err;

        // If the users array has a truthy value length, then a user with this email already exits
        if (users.length) {
          next(
            new Error(`A user already exists with the email, ${email}. Please create a user with a different email or sign-in with this email`),
          );
        }

        next();
      });
    } catch (err) {
      next(err);
    }
  },
};
