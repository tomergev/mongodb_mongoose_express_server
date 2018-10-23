const mongoose = require('mongoose');

// const { ObjectId } = mongoose.Schema.Types;

const transactionSeriesSchema = new mongoose.Schema(
  {
    // userId: {
    //   type: ObjectId,
    //   ref: 'Users',
    //   required: true,
    // },
    // chainId: {
    //   type: ObjectId,
    //   required: true,
    // },
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
