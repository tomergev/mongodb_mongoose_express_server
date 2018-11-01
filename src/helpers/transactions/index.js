const {
  web3,
  toWei,
  getBalance,
  getTransaction,
} = require('../../services/web3/');
const Account = require('../../models/Account');
const Transaction = require('../../models/Transaction');
const { winstonErrorLogging } = require('../../config/winston/');
const TransactionSeries = require('../../models/TransactionSeries');
const generateRandomNumber = require('../../lib/generateRandomNumber/');
const generateMultipleDifferentRandomNumbers = require('../../lib/generateMultipleDifferentRandomNumbers/');

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
      winstonErrorLogging(err);
    }
  },

  async sendBatchTransactions(args) {
    try {
      const {
        accounts,
        weiValue,
        smartContract,
        transactionSeriesId,
        numberOfTransactionsRange,
        selectSmartContractMethodAbi,
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

        txInfoArray.push({
          from,
          value,
          ...(smartContract ? { to: smartContract.contractAddress } : { to }),
          ...(selectSmartContractMethodAbi && { data: selectSmartContractMethodAbi }),
        });
      }

      const sendEthTransaction = async ({
        to, from, data, value,
      }) => {
        const txInfo = {
          to,
          from,
          ...(data && { data }),
          ...(value && { value }),
        };

        await web3.eth.sendTransaction(txInfo)
          .once('receipt', async (receipt) => {
            const transaction = await getTransaction(receipt.transactionHash);
            const {
              logs,
              status,
              gasUsed,
              contractAddress,
              cumulativeGasUsed,
            } = receipt;
            const {
              gas,
              hash,
              nonce,
              input,
              gasPrice,
              blockHash,
              blockNumber,
              transactionIndex,
            } = transaction;

            Transaction.create({
              gas,
              hash,
              logs,
              input,
              nonce,
              gasUsed,
              gasPrice,
              blockHash,
              blockNumber,
              txValue: value,
              pending: !status,
              transactionIndex,
              cumulativeGasUsed,
              to: transaction.to,
              transactionSeriesId,
              from: transaction.from,
              value: transaction.value,
              ...(contractAddress && { contractAddress }),
              ...(smartContract && { smartContractId: smartContract.id }),
            })
              .catch(winstonErrorLogging);
          })
          .on('error', winstonErrorLogging);
      };

      Promise.all([
        txInfoArray.map(sendEthTransaction),
        module.exports.setTransactionInterval(args),
      ]);
    } catch (err) {
      winstonErrorLogging(err);
    }
  },

  async restartTransactionSeries() {
    try {
      const [
        accounts,
        activeTransactionSeries,
      ] = await Promise.all([
        Account.find(),
        TransactionSeries.find({ active: true }),
      ]);

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
      winstonErrorLogging(err);
    }
  },
};
