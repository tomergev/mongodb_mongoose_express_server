const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    balanceWei: {
      type: String,
      required: true,
    },
    balanceEther: {
      type: String,
      required: true,
    },
    totalSentTransactions: {
      type: Number,
      required: true,
      default: 0,
    },
    totalReceivedTransactions: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Account = mongoose.model('accounts', accountSchema);

module.exports = Account;
