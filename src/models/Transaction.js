const mongoose = require('mongoose');
const Account = require('./Account');
// const winston = require('../config/winston/');

const { ObjectId } = mongoose.Schema.Types;

const winstonErrorHandling = (err) => {
  console.log(err);
  // winston.error(err);
};

const transactionSchema = new mongoose.Schema(
  {
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
    txValue: {
      type: String,
    },
    nonce: {
      type: Number,
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
    gasUsed: {
      type: Number,
    },
    gasPrice: {
      type: Number,
    },
    transactionIndex: {
      type: Number,
    },
    pending: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.post('save', ({ to, from }) => {
  Promise.all([
    Account.findOneAndUpdate({ address: from }, { $inc: { totalSentTransactions: 1 } }),
    Account.findOneAndUpdate({ address: to }, { $inc: { totalReceivedTransactions: 1 } }),
  ])
    .catch(winstonErrorHandling);
});

const Transaction = mongoose.model('transactions', transactionSchema);

module.exports = Transaction;
