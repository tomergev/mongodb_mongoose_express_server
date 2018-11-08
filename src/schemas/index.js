const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const formatSchema = require('./formatSchemas');

const allFileNames = fs.readdirSync(path.join(__dirname));

allFileNames.forEach((file) => {
  const last3Chars = file.substring(file.length - 3, file.length);
  if (last3Chars === '.js') return;

  const schema = yaml.safeLoad(
    fs.readFileSync(
      path.join(__dirname, file),
      'utf8',
    ),
  );

  const formattedSchema = formatSchema(schema);
  const schemaName = file.slice(0, file.length - 4).toLowerCase();
  module.exports[`${schemaName}Schema`] = formattedSchema;
});
