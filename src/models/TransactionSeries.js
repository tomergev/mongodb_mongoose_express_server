const mongoose = require('mongoose');

// const { ObjectId } = mongoose.Schema.Types;

const transactionSeriesSchema = new mongoose.Schema(
  {
    transactionRateRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    numberOfTransactionsRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    etherOptions: {
      value: {
        type: Number,
        default: 0,
      },
      random: {
        type: Boolean,
        default: false,
      },
    },
    smartContractAddress: {
      type: String,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    numberOfTransactionsSent: {
      type: Number,
      required: true,
      default: 0,
    },
    seriesStartDatetime: {
      type: Date,
    },
    seriesEndDatetime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

transactionSeriesSchema.pre('findOneAndUpdate', () => {
  if (this.numberOfTransactionsSent === 0) {
    this.update({}, {
      $set: {
        seriesStartDatetime: new Date(),
      },
    });
  }
});

const TransactionSeries = mongoose.model('transactionseries', transactionSeriesSchema);

module.exports = TransactionSeries;
