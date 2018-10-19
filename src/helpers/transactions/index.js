const {
  getBalance,
  sendTransaction,
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

      if (!transactionSeries.active) {
        transactionSeries.seriesEndDatetime = new Date();
        transactionSeries.save();
        return;
      }

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
        userId,
        chainId,
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
        const address2 = addressesAndBalances[count].address;
        const balance2 = addressesAndBalances[count].balance;

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

      const createTransactionEntry = ({
        to, from, value, hash,
      }) => {
        Transaction.create({
          to,
          hash,
          from,
          value,
          userId,
          chainId,
          transactionSeriesId,
        });
      };

      const sendEthTransaction = ({ to, from, value }) => {
        sendTransaction({ to, from, value })
          .then(hash => createTransactionEntry({
            hash, to, from, value: parseInt(value, 10),
          }))
          .catch(winstonErrorHandling);
      };

      Promise.all([
        txInfoArray.forEach(sendEthTransaction),
        module.exports.setTransactionInterval(args),
      ]);
    } catch (err) {
      winstonErrorHandling(err);
    }
  },
};
