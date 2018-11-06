const Block = require('../models/Block');
const { formatBlockData } = require('../helpers/blocks/');
const { ethersNewBlockListener } = require('../services/ethers/');

module.exports = {
  async get(req, res, next) {
    try {
      const {
        limit,
        $regex,
        rangeLow,
        rangeHigh,
        propeties,
      } = req.query;

      const query = {
        ...($regex && {
          blockHash: { $regex },
        }),
        ...((rangeLow || rangeHigh) && {
          blockNumber: {
            ...(rangeLow && { $gte: parseInt(rangeLow, 10) }),
            ...(rangeHigh && { $lte: parseInt(rangeHigh, 10) }),
          },
        }),
      };

      const options = {
        sort: {
          blockNumber: -1,
        },
        ...(limit && { limit: parseInt(limit, 10) }),
      };

      const blocks = await Block.find(query, propeties, options);
      res.json({ blocks });
    } catch (err) {
      next(err);
    }
  },

  async startBlockListener(req, res, next) {
    try {
      ethersNewBlockListener(formatBlockData);

      if (next) next();
      else {
        res.json({
          message: 'The block listener has been started',
        });
      }
    } catch (err) {
      next(err);
    }
  },
};
