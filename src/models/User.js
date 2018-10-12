const mongoose = require('mongoose');
const timestampPlugin = require('./plugins/timestamp');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    unique: true,
    required: true,
  },
});

userSchema.plugin(timestampPlugin);
const User = mongoose.model('User', userSchema);

module.exports = User;