const mongoose = require('mongoose');

const chainSchema = new mongoose.Schema(
  {
    asset: {
      type: String,
      required: true,
      default: 'ethereum',
      enum: [
        'ethereum',
      ],
    },
    numberOfNodes: {
      type: Number,
    },
    initialWalletBalances: {
      type: Number,
    },
    gasLimit: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = chainSchema;
