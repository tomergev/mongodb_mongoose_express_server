const solc = require('solc');
const SmartContract = require('../models/SmartContract');
const { winstonErrorLogging } = require('../config/winston/');
const { createTransactionDoc } = require('../helpers/transactions/');
const {
  fromWei,
  getBalance,
  createContractInstance,
} = require('../services/web3/');

module.exports = {
  async get(req, res, next) {
    try {
      const { limit } = req.query;

      const options = {
        ...(limit && { limit: parseInt(limit, 10) }),
        sort: {
          createdAt: -1,
        },
      };

      const smartContracts = await SmartContract.find(null, null, options);
      res.json({ smartContracts });
    } catch (err) {
      next(err);
    }
  },

  async findOne(req, res, next) {
    try {
      const { contractAddress } = req.params;

      const [
        balanceWei,
        smartContract,
      ] = await Promise.all([
        getBalance(contractAddress),
        SmartContract.findOne({ contractAddress }),
      ]);

      const balanceEther = fromWei(balanceWei);

      res.json({
        balanceWei,
        balanceEther,
        smartContract,
      });
    } catch (err) {
      next(err);
    }
  },

  async deploy(req, res, next) {
    try {
      const {
        address,
        contractName,
        smartContractUtf8,
      } = req.body;

      // Compling the smart contract
      const output = solc.compile({
        sources: { smartContractUtf8 },
      }, 1);

      let abi;
      let bytecode;
      const keys = Object.keys(output.contracts);
      keys.forEach((key) => {
        bytecode = output.contracts[key].bytecode; // eslint-disable-line prefer-destructuring
        abi = JSON.parse(output.contracts[key].interface);
      });


      // Creating the contract instance
      const contractInstance = await createContractInstance({
        abi,
        address,
        txInfo: {
          from: address,
          data: `0x${bytecode}`,
        },
      });

      // "Deploying" (preDeploying) the contract to the chain
      const prepDeployContract = contractInstance.deploy();
      // Estimating gas for the contract & getting abi bytecode
      const gas = await prepDeployContract.estimateGas();

      const methodNamesAndInputs = {};
      abi.forEach(({ type, name, inputs }) => {
        if (type === 'function') {
          methodNamesAndInputs[name] = inputs;
        }
      });

      const smartContract = await SmartContract.create({
        abi,
        bytecode,
        contractName,
        smartContractUtf8,
        methodNamesAndInputs,
        senderAddress: address,
      });

      // Sending the contract to the chain
      const deployedSmartContract = await prepDeployContract.send({ gas })
        .once('receipt', receipt => createTransactionDoc({ receipt, smartContract }))
        .on('error', (err) => {
          winstonErrorLogging(err);
          SmartContract.deleteOne({ id: smartContract.id });
        });

      smartContract.contractAddress = deployedSmartContract.options.address;
      smartContract.save();

      res.json({ smartContract });
    } catch (err) {
      next(err);
    }
  },
};
