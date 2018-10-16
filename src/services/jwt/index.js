const jwt = require('jsonwebtoken');
const config = require('../../config/');

module.exports = {
  signToken({ id }) {
    const token = jwt.sign({ id }, config.jwt.secret, {
      // Expires in 30 days
      expiresIn: 86400 * 30,
    });

    return token;
  },
};
