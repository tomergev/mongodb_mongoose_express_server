const solc = require('solc');
const Transaction = require('../models/Transaction');
const { createContract } = require('../services/web3/');
const SmartContract = require('../models/SmartContract');
const { winstonErrorHandling } = require('../config/winston/');

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

  async deploy(req, res, next) {
    try {
      const {
        name,
        address,
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
      const contractInstance = await createContract({
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
      const [
        gas,
        abiBytecode,
      ] = await Promise.all([
        prepDeployContract.estimateGas(),
        prepDeployContract.encodeABI(),
      ]);

      const smartContract = await SmartContract.create({
        abi,
        name,
        bytecode,
        abiBytecode,
        smartContractUtf8,
        senderAddress: address,
      });

      // Sending the contract to the chain
      const deployedSmartContract = await prepDeployContract.send({ gas })
        .once('transactionHash', (hash) => {
          Transaction.create({
            hash,
            from: address,
            deployedContract: true,
            smartContractId: smartContract.id,
          })
            .catch(winstonErrorHandling);
        })
        .on('error', (err) => {
          winstonErrorHandling(err);
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
