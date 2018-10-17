const User = require('../models/User');

module.exports = {
  async create(req, res, next) {
    try {
      const {
        asset,
        gasLimit,
        numberOfNodes,
        initialWalletBalances,
      } = req.body;

      await User.findOneAndUpdate(
        {
          _id: req.user.id,
        },
        {
          chain: {
            ...(asset && { asset }),
            ...(gasLimit && { gasLimit }),
            ...(numberOfNodes && { numberOfNodes }),
            ...(initialWalletBalances && { initialWalletBalances }),
          },
        },
      );

      next();
    } catch (err) {
      next(err);
    }
  },
};
