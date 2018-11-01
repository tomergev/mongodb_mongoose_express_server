const {
  toWei,
  fromWei,
  createContractInstance,
} = require('../services/web3/');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const SmartContract = require('../models/SmartContract');
const { createAllAccounts } = require('../helpers/accounts');
const TransactionSeries = require('../models/TransactionSeries');
const { setTransactionInterval } = require('../helpers/transactions/');

module.exports = {
  async get(req, res, next) {
    try {
      const {
        limit,
        address,
        dateHigh,
        weiToEther,
        blockNumber,
        transactionIndex,
      } = req.query;

      const options = {
        ...(limit && { limit: parseInt(limit, 10) }),
        sort: {
          ...(blockNumber ? { transactionIndex: 1 } : { createdAt: -1 }),
        },
      };

      const query = {
        blockNumber: {
          $ne: null,
          ...(blockNumber && { $eq: blockNumber }),
        },
        ...(dateHigh && {
          createdAt: {
            $lte: new Date(dateHigh),
          },
        }),
        ...(transactionIndex && {
          transactionIndex: {
            $gt: parseInt(transactionIndex, 10),
          },
        }),
        ...(address && {
          $or: [
            { to: address },
            { from: address },
          ],
        }),
      };

      let transactions = await Transaction.find(query, null, options);

      transactions = await Promise.all(
        transactions.map(async (tx) => {
          let value;
          let smartContract;

          if (weiToEther && tx.value) {
            value = parseFloat(fromWei(tx.value), 10).toFixed(2);
          }
          if (tx.smartContractId) {
            smartContract = await SmartContract.findById(tx.smartContractId, 'contractAddress');
          }

          return {
            ...tx._doc, // eslint-disable-line no-underscore-dangle
            ...(value, { value }),
            ...(smartContract && { smartContract }),
          };
        }),
      );

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
      if (weiToEther) transaction.value = parseFloat(fromWei(transaction.value), 10).toFixed(2);
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
      const {
        limit,
        dateHigh,
        onlyActiveTransactionSeries,
      } = req.query;

      const query = {
        ...(onlyActiveTransactionSeries && { active: true }),
        ...(dateHigh && {
          createdAt: {
            $lte: new Date(dateHigh),
          },
        }),
      };

      const options = {
        ...(limit && { limit: parseInt(limit, 10) }),
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
      const activeTransactionSeries = await TransactionSeries.find({ active: true });

      if (activeTransactionSeries.length) {
        throw new Error(
          'There is already a transaction series in place. Please cancel that transaction series before creating a new one',
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
        selectedSmartContractMethod,
        selectedSmartContractAddress: smartContractAddress,
      } = req.body;

      const selectedSmartContractArgs = req.body.selectedSmartContractArgs || [];

      let weiValue;
      if (etherOptions) {
        const { value, random } = etherOptions;
        weiValue = random === 'true' ? 'random' : toWei(`${value}`);
      }

      let accounts = await Account.find();
      if (!accounts.length) {
        accounts = await createAllAccounts();
      }

      let smartContract;
      let selectSmartContractMethodAbi;
      if (smartContractAddress) {
        smartContract = await SmartContract.findOne({ contractAddress: smartContractAddress });
        const smartContractInstance = await createContractInstance({
          abi: smartContract.abi,
          address: smartContract.contractAddress,
        });
        const smartContractMethod = smartContractInstance.methods['eventEmitter'](...selectedSmartContractArgs);
        selectSmartContractMethodAbi = smartContractMethod.encodeABI();
      }

      const transactionSeries = await TransactionSeries.create({
        etherOptions,
        smartContractAddress,
        transactionRateRange,
        numberOfTransactionsRange,
        seriesStartDatetime: new Date(),
      });

      setTransactionInterval({
        accounts,
        weiValue,
        smartContract,
        transactionRateRange,
        numberOfTransactionsRange,
        selectSmartContractMethodAbi,
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
