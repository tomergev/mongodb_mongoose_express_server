const { toWei, fromWei } = require('../services/web3/');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { createAllAccounts } = require('../helpers/accounts');
const TransactionSeries = require('../models/TransactionSeries');
const { setTransactionInterval } = require('../helpers/transactions/');

module.exports = {
  async get(req, res, next) {
    try {
      const {
        limit,
        dateLow,
        dateHigh,
      } = req.query;

      const options = {
        ...(limit && { limit: parseInt(limit, 10) }),
        sort: {
          createdAt: -1,
        },
      };

      const query = {};
      if (dateLow || dateHigh) {
        query.createdAt = {
          ...(dateLow && { $gte: new Date(dateLow) }),
          ...(dateHigh && { $lte: new Date(dateHigh) }),
        };
      }

      console.log(query, options);

      const transactions = await Transaction.find(query, null, options);
      res.json({ transactions });
    } catch (err) {
      next(err);
    }
  },

  async getTransaction(req, res, next) {
    try {
      const { hash } = req.params;
      const { weiToEther } = req.query;
      const transaction = await Transaction.findOne({ hash });
      if (weiToEther) transaction.value = (parseInt(fromWei(transaction.value), 10)).toFixed(2);
      res.json({ transaction });
    } catch (err) {
      next(err);
    }
  },

  async stop(req, res, next) {
    try {
      await TransactionSeries.updateMany(
        { active: true },
        {
          active: false,
          seriesEndDatetime: new Date(),
        },
      );

      res.json({
        message: 'All transaction series have been stopped',
      });
    } catch (err) {
      next(err);
    }
  },

  async getTransactionSeries(req, res, next) {
    try {
      const { onlyActiveTransactionSeries } = req.query;
      const query = {};

      if (onlyActiveTransactionSeries) {
        query.active = true;
      }

      const options = {
        sort: {
          seriesStartDatetime: -1,
        },
      };

      const transactionSeries = await TransactionSeries.find(query, null, options);
      res.json({ transactionSeries });
    } catch (err) {
      next(err);
    }
  },

  async checkIfTransactionsInProgress(req, res, next) {
    try {
      const transactionSeries = await TransactionSeries.find({ active: true });

      if (transactionSeries.length) {
        next(
          new Error('There is already a transaction series in place. Please cancel that transaction series before creating a new one'),
        );
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  },

  async createTransactionSeries(req, res, next) {
    try {
      const {
        etherOptions,
        transactionRateRange,
        numberOfTransactionsRange,
      } = req.body;

      const { value, random } = etherOptions;
      const weiValue = random === 'true' ? 'random' : toWei(`${value}`);

      let [
        accounts,
        transactionSeries,
      ] = await Promise.all([
        Account.find(),
        TransactionSeries.create({
          etherOptions,
          transactionRateRange,
          numberOfTransactionsRange,
          seriesStartDatetime: new Date(),
        }),
      ]);

      if (!accounts.length) {
        accounts = await createAllAccounts();
      }

      setTransactionInterval({
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
