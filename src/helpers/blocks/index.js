const Block = require('../../models/Block');
const Account = require('../../models/Account');
// const winston = require('../config/winston/');
const { getBlock } = require('../../services/web3/');
const { createAllAccounts } = require('../accounts/');
const { createTransactionDocs } = require('../transactions/');

const winstonErrorHandling = (err) => {
  console.log(err);
  // winston.error(err);
};

module.exports = {
  async formatBlockData(blockNumber) {
    try {
      const {
        totalDifficulty,
        transactions,
        difficulty,
        parentHash,
        sha3Uncles,
        timestamp,
        gasLimit,
        gasUsed,
        uncles,
        nonce,
        miner,
        size,
        hash,
      } = await getBlock(blockNumber);

      createTransactionDocs(transactions);
      const numberOfUncles = uncles.length;
      const numberOfProccessedTransactions = transactions.length;

      let allBalancesAndAddresses = await Account.find({}, 'balance address');

      if (!allBalancesAndAddresses.length) {
        allBalancesAndAddresses = await createAllAccounts();
      }

      const accountBalances = allBalancesAndAddresses.reduce((obj, { address, balance }) => {
        obj[address] = balance; // eslint-disable-line no-param-reassign
        return obj;
      }, {});


      const blockInfo = {
        blockCreationDate: new Date(timestamp * 1000),
        numberOfProccessedTransactions,
        accountBalances,
        blockSize: size,
        totalDifficulty,
        blockHash: hash,
        numberOfUncles,
        transactions,
        blockNumber,
        sha3Uncles,
        parentHash,
        difficulty,
        timestamp,
        gasLimit,
        gasUsed,
        nonce,
        miner,
      };

      Block.create(blockInfo, winstonErrorHandling);
    } catch (err) {
      winstonErrorHandling(err);
    }
  },
};
