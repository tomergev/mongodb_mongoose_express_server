const solc = require('solc');
const { createContract } = require('../services/web3/');
const SmartContract = require('../models/SmartContract');

module.exports = {
  async get(req, res, next) {
    try {
      const smartContracts = await SmartContract.find();
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
      let byteCode;
      const keys = Object.keys(output.contracts);
      keys.forEach((key) => {
        byteCode = output.contracts[key].bytecode;
        abi = JSON.parse(output.contracts[key].interface);
      });


      // Creating the contract instance
      const contractInstance = await createContract({
        abi,
        address,
        txInfo: {
          from: address,
          data: `0x${byteCode}`,
        },
      });

      // "Deploying" (preDeploying) the contract to the chain
      const prepDeployContract = contractInstance.deploy();
      // Estimating gas for the contract
      const gas = await prepDeployContract.estimateGas();
      // Sending the contract to the chain
      const deployedContract = await prepDeployContract.send({ gas });

      const smartContract = await SmartContract.create({
        abi,
        name,
        byteCode,
        address,
        smartContractUtf8,
      });
      debugger;

      res.json({ smartContract });
    } catch (err) {
      next(err);
    }
  },
};
