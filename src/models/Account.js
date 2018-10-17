const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    chainId: {
      type: ObjectId,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
