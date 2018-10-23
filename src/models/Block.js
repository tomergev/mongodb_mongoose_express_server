const mongoose = require('mongoose');

// const { ObjectId } = mongoose.Schema.Types;

const blockSchema = new mongoose.Schema(
  {
    // userId: {
    //   type: ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    // chainId: {
    //   type: ObjectId,
    //   required: true,
    // },
    blockCreationDate: {
      type: Date,
      required: true,
    },
    numberOfProccessedTransactions: {
      type: Number,
      required: true,
    },
    accountBalances: {
      type: Map,
      of: Number,
      required: true,
    },
    blockSize: {
      type: Number,
      required: true,
    },
    totalDifficulty: {
      type: Number,
      required: true,
    },
    blockHash: {
      type: String,
      required: true,
    },
    numberOfUncles: {
      type: Number,
      required: true,
    },
    transactions: {
      type: Array,
      required: true,
    },
    blockNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    sha3Uncles: {
      type: String,
      required: true,
    },
    parentHash: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    gasLimit: {
      type: Number,
      required: true,
    },
    gasUsed: {
      type: Number,
      required: true,
    },
    nonce: {
      type: String,
      required: true,
    },
    miner: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Block = mongoose.model('blocks', blockSchema);

module.exports = Block;
