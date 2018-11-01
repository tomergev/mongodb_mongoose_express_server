const {
  getBalance,
  getAccounts,
} = require('../../services/web3/');
const Account = require('../../models/Account');
const { fromWei } = require('../../services/web3/');
const { winstonErrorLogging } = require('../../config/winston/');

module.exports = {
  createAllAccounts() {
    return new Promise(async (resolve, reject) => {
      try {
        const addresses = await getAccounts();
        const accounts = [];

        const insertAccounts = await Promise.all(
          addresses.map(async (address) => {
            const balanceWei = await getBalance(address);
            const balanceEther = fromWei(balanceWei);

            const document = {
              address,
              balanceWei,
              balanceEther,
            };

            accounts.push(document);

            return {
              insertOne: { document },
            };
          }),
        );

        await Account.bulkWrite(insertAccounts);
        resolve(accounts);
      } catch (err) {
        winstonErrorLogging(err);
        reject(err);
      }
    });
  },
};
