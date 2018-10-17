const Account = require('../models/Account');
const {
  getAccounts,
  getBalance,
} = require('../services/web3/');

module.exports = {
  async get(req, res, next) {
    try {
      const { user } = req;

      const query = {
        userId: user.id,
        chainId: user.chain.id,
      };

      const accounts = await Account.find(query);
      res.json({ accounts });
    } catch (err) {
      next(err);
    }
  },

  async createAllAccounts(req, res, next) {
    try {
      const { user } = req;
      const userId = user.id;
      const chainId = user.chain.id;

      const addresses = await getAccounts();

      const insertAccounts = await Promise.all(
        addresses.map(async address => ({
          insertOne: {
            document: {
              userId,
              chainId,
              address,
              balance: parseInt(await getBalance(address), 10),
            },
          },
        })),
      );

      Account.bulkWrite(insertAccounts);

      res.json({
        user,
        message: `A block listener is active for user ${userId}`,
      });
    } catch (err) {
      next(err);
    }
  },
};
