const { toWei } = require('../services/web3/');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const TransactionSeries = require('../models/TransactionSeries');
const { setTransactionInterval } = require('../helpers/transactions/');

module.exports = {
  async get(req, res, next) {
    try {
      const userId = req.user.id;
      const chainId = req.user.chain.id;

      const query = Transaction.find();

      const transactions = await query
        .collection(Transaction.collection)
        .sort({ transactionSentTimestamp: 1 })
        .exec();

      res.json({ transactions });


      // const query = {
      //   userId,
      //   chainId,
      // };

      // const transactions = await Transaction.find(query);

      // res.json({ transactions });
    } catch (err) {
      next(err);
    }
  },

  async createTransactionSeries(req, res, next) {
    try {
      const userId = req.user.id;
      const chainId = req.user.chain.id;
      const {
        etherOptions,
        transactionRateRange,
        numberOfTransactionsRange,
      } = req.body;

      const { value, random } = etherOptions;
      const weiValue = !random ? toWei(`${value}`) : 'random';

      const [
        accounts,
        transactionSeries,
      ] = await Promise.all([
        Account.find({ userId, chainId }),
        TransactionSeries.create({
          userId,
          chainId,
          etherOptions,
          transactionRateRange,
          numberOfTransactionsRange,
        }),
      ]);

      setTransactionInterval({
        userId,
        chainId,
        accounts,
        weiValue,
        transactionRateRange,
        numberOfTransactionsRange,
        transactionSeriesId: transactionSeries.id,
      });

      res.json({
        message: 'Created transaction series',
        transactionSeries,
      });
    } catch (err) {
      next(err);
    }
  },
};
