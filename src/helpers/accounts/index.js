const {
  getBalance,
  getAccounts,
} = require('../../services/web3/');
const Account = require('../../models/Account');
// const winston = require('../../config/winston/');

module.exports = {
  createAllAccounts() {
    return new Promise(async (resolve, reject) => {
      try {
        const addresses = await getAccounts();
        const accounts = [];

        const insertAccounts = await Promise.all(
          addresses.map(async (address) => {
            const document = {
              address,
              balance: parseInt(await getBalance(address), 10),
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
        console.log(err);
        // winston.error(err);
        reject(err);
      }
    });
  },
};
