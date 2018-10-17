const Block = require('../models/Block');
const Account = require('../models/Account');
// const winston = require('../config/winston/');
const { getBlock } = require('../services/web3/');
const { ethersNewBlockListener } = require('../services/ethers/');

module.exports = {
  async get(req, res, next) {
    try {
      const { user } = req;
      const userId = user.id;

      const {
        rangeLow,
        rangeHigh,
      } = req.query;

      const query = {
        userId,
        chainId: user.chain.id,
      };

      if (rangeLow || rangeHigh) {
        query.blockNumber = {
          ...(rangeLow && { $gte: parseInt(rangeLow, 10) }),
          ...(rangeHigh && { $lte: parseInt(rangeHigh, 10) }),
        };
      }

      const blocks = await Block.find(query);
      res.json({ blocks });
    } catch (err) {
      next(err);
    }
  },

  async startBlockListener(req, res, next) {
    try {
      const { user } = req;
      const userId = user.id;
      const chainId = user.chain.id;

      ethersNewBlockListener(async (blockNumber) => {
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

          const allBalancesAndAddresses = await Account.find({ chainId, userId }, 'balance address');
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
            chainId,
            gasUsed,
            userId,
            nonce,
            miner,
          };

          Block.create(blockInfo, (err) => {
            if (err) throw err;
          });
        } catch (err) {
          console.log(err);
          // winston.error(err);
        }
      });

      next();
    } catch (err) {
      next(err);
    }
  },
};
