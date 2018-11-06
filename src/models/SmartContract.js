const mongoose = require('mongoose');

const smartContractSchema = new mongoose.Schema(
  {
    abi: {
      type: [],
      required: true,
    },
    methodNamesAndInputs: {
      type: Object,
      required: true,
    },
    bytecode: {
      type: String,
      required: true,
    },
    senderAddress: {
      type: String,
      required: true,
    },
    smartContractUtf8: {
      type: String,
      required: true,
    },
    contractName: {
      type: String,
      required: true,
    },
    contractAddress: {
      type: String,
    },
    transactionCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

smartContractSchema.index({ contractAddress: 1 }, { unique: true });
const SmartContract = mongoose.model('smartcontracts', smartContractSchema);

module.exports = SmartContract;
