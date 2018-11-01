const mongoose = require('mongoose');
const Account = require('./Account');
const TransactionSeries = require('./TransactionSeries');
const { winstonErrorLogging } = require('../config/winston/');

const { ObjectId } = mongoose.Schema.Types;

const transactionSchema = new mongoose.Schema(
  {
    transactionSeriesId: {
      type: ObjectId,
      ref: 'TransactionSeries',
    },
    smartContractId: {
      type: ObjectId,
    },
    hash: {
      type: String,
      required: true,
      // unique: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
    },
    value: {
      type: String,
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
    input: {
      type: String,
    },
    cumulativeGasUsed: {
      type: Number,
    },
    logs: {
      type: [],
    },
    contractAddress: {
      type: String,
    },
    pending: {
      type: Boolean,
      required: true,
      default: true,
    },
    deployedContract: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.post('save', ({ to, from, transactionSeriesId }) => {
  Promise.all([
    Account.findOneAndUpdate({ address: from }, { $inc: { totalSentTransactions: 1 } }),
    // Checking if "to" exists. When deploying a contract, there is no "to" value
    (to && Account.findOneAndUpdate({ address: to }, { $inc: { totalReceivedTransactions: 1 } })),
    // Checking if transactionSeriesId exists, when deploying a contract, this value is null
    (transactionSeriesId && TransactionSeries.findOneAndUpdate(
      { _id: transactionSeriesId },
      { $inc: { numberOfTransactionsSent: 1 } },
    )),
  ])
    .catch(winstonErrorLogging);
});

// transactionSchema.index({ hash: 1 }, { unique: true });
const Transaction = mongoose.model('transactions', transactionSchema);

module.exports = Transaction;
