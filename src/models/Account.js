const mongoose = require('mongoose');
const { accountSchema } = require('../schemas/');

const AccountSchema = new mongoose.Schema(
  accountSchema,
  { timestamps: true },
);

const Account = mongoose.model('accounts', AccountSchema);

module.exports = Account;
