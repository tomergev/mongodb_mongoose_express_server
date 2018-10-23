const ethers = require('ethers');
const { formatBlockData } = require('../../helpers/blocks/');

const ganacheUrl = 'http://127.0.0.1:8545';
const provider = new ethers.providers.JsonRpcProvider(ganacheUrl);

const blockListener = () => {
  provider.on('block', formatBlockData);
};

const ethersNewBlockListener = (callback) => {
  provider.on('block', callback);
};

module.exports = {
  blockListener,
  ethersNewBlockListener,
};
