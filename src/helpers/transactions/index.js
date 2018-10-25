const {
  toWei,
  getBalance,
  getTransaction,
  sendTransaction,
  getTransactionReceipt,
} = require('../../services/web3/');
// const winston = require('../../config/winston/');
const Transaction = require('../../models/Transaction');
const TransactionSeries = require('../../models/TransactionSeries');
const generateRandomNumber = require('../../lib/generateRandomNumber/');
const generateMultipleDifferentRandomNumbers = require('../../lib/generateMultipleDifferentRandomNumbers/');

const winstonErrorHandling = (err) => {
  console.log(err);
  // winston.error(err);
};

module.exports = {
  async setTransactionInterval(args) {
    try {
      const {
        transactionSeriesId,
        transactionRateRange,
      } = args;

      const transactionSeries = await TransactionSeries.findById(transactionSeriesId);
      if (!transactionSeries.active) return;
      const randomMillisecondInterval = generateRandomNumber(transactionRateRange) * 1000;

      setTimeout(
        () => module.exports.sendBatchTransactions(args),
        randomMillisecondInterval,
      );
    } catch (err) {
      winstonErrorHandling(err);
    }
  },

  async sendBatchTransactions(args) {
    try {
      const {
        accounts,
        weiValue,
        transactionSeriesId,
        numberOfTransactionsRange,
      } = args;

      const limit = generateRandomNumber(numberOfTransactionsRange) * 2;
      const randomNumbers = generateMultipleDifferentRandomNumbers({ limit, max: accounts.length });

      const addressesAndBalances = await Promise.all(
        randomNumbers.map(async number => ({
          address: accounts[number].address,
          balance: await getBalance(accounts[number].address),
        })),
      );

      const txInfoArray = [];

      for (let count = 0; count < limit; count += 2) {
        const address1 = addressesAndBalances[count].address;
        const balance1 = addressesAndBalances[count].balance;
        const address2 = addressesAndBalances[count + 1].address;
        const balance2 = addressesAndBalances[count + 1].balance;

        let to;
        let from;
        let biggerBalance;

        if (balance1 >= balance2) {
          to = address2;
          from = address1;
          biggerBalance = balance1;
        } else {
          to = address1;
          from = address2;
          biggerBalance = balance2;
        }

        const value = weiValue === 'random' ? generateRandomNumber({ min: biggerBalance * 0.025, max: biggerBalance * 0.05 }) : weiValue;
        txInfoArray.push({ to, from, value });
      }

      const sendEthTransaction = async ({ to, from, value }) => {
        await sendTransaction({ to, from, value })
          .then((hash) => {
            Transaction.create({
              hash, to, from, transactionSeriesId, value,
            });

            TransactionSeries.findOneAndUpdate(
              { _id: transactionSeriesId },
              { $inc: { numberOfTransactionsSent: 1 } },
              winstonErrorHandling,
            );
          })
          .catch(winstonErrorHandling);
      };

      Promise.all([
        txInfoArray.map(sendEthTransaction),
        module.exports.setTransactionInterval(args),
      ]);
    } catch (err) {
      winstonErrorHandling(err);
    }
  },

  async restartTransactionSeries(accounts) {
    try {
      const activeTransactionSeries = await TransactionSeries.find({ active: true });

      activeTransactionSeries.forEach((transactionSeries) => {
        const {
          etherOptions,
          transactionRateRange,
          numberOfTransactionsRange,
        } = transactionSeries;

        const { value, random } = etherOptions;
        const weiValue = random === 'true' ? 'random' : toWei(`${value}`);

        module.exports.setTransactionInterval({
          accounts,
          weiValue,
          transactionRateRange,
          numberOfTransactionsRange,
          transactionSeriesId: transactionSeries.id,
        });
      });
    } catch (err) {
      winstonErrorHandling(err);
    }
  },

  async createTransactionDocs(txHashs) {
    try {
      if (!txHashs.length) return;

      const transactions = await Promise.all(
        txHashs.map(hash => Promise.all([
          getTransaction(hash),
          getTransactionReceipt(hash),
        ])),
      );

      const updateTransactions = transactions.map(([transaction, receipt]) => {
        const {
          gas,
          hash,
          value,
          gasPrice,
          blockHash,
          blockNumber,
          transactionIndex,
        } = transaction;
        const { gasUsed } = receipt;

        return {
          updateOne: {
            filter: { hash },
            update: {
              gas,
              hash,
              gasUsed,
              gasPrice,
              blockHash,
              blockNumber,
              txValue: value,
              pending: false,
              transactionIndex,
            },
          },
        };
      });

      Transaction.bulkWrite(updateTransactions);

      // if (!txHashs.length) return;

      // const transactions = await Promise.all(
      //   txHashs.map(hash => getTransaction(hash)),
      // );


      // const updateTransactions = transactions.map(({
      // gas,
      // hash,
      // gasPrice,
      // blockHash,
      // blockNumber,
      // }) => ({
      //   updateOne: {
      //     filter: { hash },
      //     update: {
      //       gas,
      //       gasPrice,
      //       blockHash,
      //       blockNumber,
      //     },
      //   },
      // }));

      // Transaction.bulkWrite(updateTransactions);
    } catch (err) {
      winstonErrorHandling(err);
    }
  },
};
