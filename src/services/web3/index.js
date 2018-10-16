const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

const executeWeb3Command = (domain, property, args) => new Promise((resolve, reject) => {
  web3[domain][property](...args, (err, res) => {
    if (err) reject(err);
    resolve(res);
  });
});

module.exports = {
  getBlock: blockNumber => executeWeb3Command('eth', 'getBlock', [blockNumber]),
};
