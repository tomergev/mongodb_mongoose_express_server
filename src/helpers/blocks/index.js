const Block = require('../../models/Block');
const Account = require('../../models/Account');
const { getBlock } = require('../../services/web3/');
const { createAllAccounts } = require('../accounts/');
const { winstonErrorLogging } = require('../../config/winston/');

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

      const numberOfUncles = uncles.length;
      const numberOfProccessedTransactions = transactions.length;

      let allBalancesAndAddresses = await Account.find({}, 'balanceWei address');

      if (!allBalancesAndAddresses.length) {
        allBalancesAndAddresses = await createAllAccounts();
      }

      const accountBalances = allBalancesAndAddresses.reduce((obj, { address, balanceWei }) => {
        obj[address] = balanceWei; // eslint-disable-line no-param-reassign
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

      Block.create(blockInfo, winstonErrorLogging);
    } catch (err) {
      winstonErrorLogging(err);
    }
  },
};
