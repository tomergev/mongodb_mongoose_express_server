const mongoose = require('mongoose');

const smartContractSchema = new mongoose.Schema(
  {
    abi: {
      type: [Map],
      required: true,
    },
    byteCode: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    smartContractUtf8: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const SmartContract = mongoose.model('smartcontracts', smartContractSchema);

module.exports = SmartContract;
