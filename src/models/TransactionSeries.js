const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const transactionSeriesSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'Users',
      required: true,
    },
    chainId: {
      type: ObjectId,
      required: true,
    },
    transactionRateRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    numberOfTransactionsRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    etherOptions: {
      value: {
        type: Number,
      },
      random: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    seriesStartDatetime: {
      type: Date,
      required: true,
      default: new Date(),
    },
    seriesEndDatetime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const TransactionSeries = mongoose.model('transactionseries', transactionSeriesSchema);

module.exports = TransactionSeries;
