const fs = require('fs');
const path = require('path');

const allFileNames = fs.readdirSync(path.join(__dirname));

allFileNames.forEach((file) => {
  if (file === 'index.js') return;

  module.exports[path.basename(file, '.js')] = require(path.join(__dirname, file)); 
});
