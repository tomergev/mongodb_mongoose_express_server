const solc = require('solc');
const Transaction = require('../models/Transaction');
const SmartContract = require('../models/SmartContract');
const { winstonErrorLogging } = require('../config/winston/');
const {
  getTransaction,
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
      const smartContract = await SmartContract.findOne({ contractAddress });
      res.json({ smartContract });
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
      const [
        gas,
        abiBytecode,
      ] = await Promise.all([
        prepDeployContract.estimateGas(),
        prepDeployContract.encodeABI(),
      ]);

      const smartContract = await SmartContract.create({
        abi,
        bytecode,
        abiBytecode,
        contractName,
        smartContractUtf8,
        senderAddress: address,
      });

      // Sending the contract to the chain
      const deployedSmartContract = await prepDeployContract.send({ gas })
        .once('receipt', async (receipt) => {
          const transaction = await getTransaction(receipt.transactionHash);

          const {
            logs,
            status,
            gasUsed,
            contractAddress,
            cumulativeGasUsed,
          } = receipt;
          const {
            to,
            hash,
            from,
            value,
            nonce,
            input,
            gasPrice,
            blockHash,
            blockNumber,
            transactionIndex,
          } = transaction;

          Transaction.create({
            to,
            logs,
            hash,
            from,
            value,
            nonce,
            input,
            gasUsed,
            gasPrice,
            blockHash,
            blockNumber,
            txValue: value,
            contractAddress,
            pending: !status,
            transactionIndex,
            cumulativeGasUsed,
            gas: transaction.gas,
            deployedContract: true,
            smartContractId: smartContract.id,
          })
            .catch(winstonErrorLogging);
        })
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
