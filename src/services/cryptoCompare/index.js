const request = require('request');

// Doc: https://www.cryptocompare.com/api/#-api-data-price-
const cryptoCompareEndPoint = 'https://min-api.cryptocompare.com/';

module.exports = {
  // fsym: From symbol, tsyms: to symbols
  converisionRate(fsym = 'ETH', tsyms = 'USD') {
    return new Promise((resolve, reject) => {
      request(
        `${cryptoCompareEndPoint}data/price?fsym=${fsym}&tsyms=${tsyms}`,
        (err, _res, body) => {
          if (err) reject(err);
          resolve(JSON.parse(body));
        },
      );
    });
  },
};
