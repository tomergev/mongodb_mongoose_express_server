const fs = require('fs');
const path = require('path');

const allFileNames = fs.readdirSync(path.join(__dirname));

const collections = [];

allFileNames.forEach((file) => {
  const last3Chars = file.substring(file.length - 3, file.length);

  if (last3Chars === '.js' && file !== 'index.js') {
    const model = file.slice(0, file.length - 3);
    const modelLowerCase = model.toLowerCase();
    // If the model's name is not transactionseries, add an s; transactionseries is already plural
    collections.push(`${modelLowerCase}${(modelLowerCase !== 'transactionseries' ? 's' : '')}`);
  }
});

module.exports = collections;
