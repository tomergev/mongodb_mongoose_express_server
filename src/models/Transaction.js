const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: 'Users',
    },
    chainId: {
      type: ObjectId,
      required: true,
    },
    transactionSeriesId: {
      type: ObjectId,
      required: true,
      ref: 'TransactionSeries',
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
    transactionSentTimestamp: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model('transactions', transactionSchema);

module.exports = Transaction;
