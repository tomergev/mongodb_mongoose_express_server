const Account = require('../models/Account');
const { createAllAccounts } = require('../helpers/accounts/');
const { converisionRate } = require('../services/cryptoCompare/');
const {
  fromWei,
  getBalance,
} = require('../services/web3/');

module.exports = {
  async get(req, res, next) {
    try {
      const accounts = await Account.find();
      res.json({ accounts });
    } catch (err) {
      next(err);
    }
  },

  async getAccount(req, res, next) {
    try {
      const { toUsd } = req.query;
      const { address } = req.params;

      const [
        balanceWei,
        account,
      ] = await Promise.all([
        getBalance(address),
        Account.findOne({ address }),
      ]);

      account.balanceWei = balanceWei;
      const balanceEther = fromWei(balanceWei);
      account.balanceEther = balanceEther;
      account.save();

      let balanceDollars;
      if (toUsd) {
        const { USD } = await converisionRate();
        balanceDollars = parseInt(balanceEther, 10) * USD;
      }

      res.json({
        account,
        ...(toUsd && { balanceDollars }),
      });
    } catch (err) {
      next(err);
    }
  },

  createAllAccounts(req, res, next) {
    try {
      createAllAccounts();

      res.json({
        message: 'All accounts have been created',
      });
    } catch (err) {
      next(err);
    }
  },
};
