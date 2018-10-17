const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    blockHash: {
      type: String,
    },
    blockNumber: {
      type: Number,
    },
    gas: {
      type: Number,
    },
    gasPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
