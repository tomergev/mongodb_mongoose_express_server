const User = require('../models/User');
const Block = require('../models/Block');
// const winston = require('../config/winston/');
const { getBlock } = require('../services/web3/');
const { ethersNewBlockListener } = require('../services/ethers/');

module.exports = {
  async get(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        rangeLow,
        rangeHigh,
      } = req.query;

      const query = {
        userId,
        blockNumber: {
          ...(rangeLow && { $gte: parseInt(rangeLow, 10) }),
          ...(rangeHigh && { $lte: parseInt(rangeHigh, 10) }),
        },
      };

      const blocks = await Block.find(query);
      res.json({ blocks });
    } catch (err) {
      next(err);
    }
  },

  async startBlockListener(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (user.isBlockListenerActive) {
        throw new Error(`There is already a block listener active for user ${userId}`);
      }

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

          const blockInfo = {
            blockCreationDate: new Date(timestamp * 1000),
            numberOfProccessedTransactions,
            accountBalances: {},
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

      user.isBlockListenerActive = true;
      await user.save();

      res.json({
        user,
        message: `A block listener is active for user ${userId}`,
      });
    } catch (err) {
      next(err);
    }
  },
};
