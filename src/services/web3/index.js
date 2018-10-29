const Web3 = require('web3');
const methods = require('./methods');

const ganacheUrl = 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));

const executeWeb3Command = ({ domain, property }) => (...args) => new Promise((resolve, reject) => {
  web3[domain][property](...args, (err, res) => {
    if (err) reject(err);
    resolve(res);
  });
});

const methodKeys = Object.keys(methods);

const web3Calls = methodKeys.reduce((obj, key) => {
  const { domain } = methods[key];
  obj[key] = executeWeb3Command({ domain, property: key }); // eslint-disable-line no-param-reassign
  return obj;
}, {});

module.exports = {
  ...web3Calls,
  // From & to wei is not a func and therefore the executeWeb3Command wont work with this action
  toWei: number => web3.utils.toWei(number),
  fromWei: number => web3.utils.fromWei(number),
  createContract: ({ abi, address, txInfo }) => {
    const contractInstance = new web3.eth.Contract(abi, address, txInfo);
    return contractInstance;
  },
};
