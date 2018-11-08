/* eslint object-shorthand: 0 */
const mongoose = require('mongoose');

const {
  Date,
  Array,
  Mixed,
  Buffer,
  String,
  Number,
  Boolean,
  ObjectId,
  Decimal128,
} = mongoose.Schema.Types;

const mongooseSchemaTypes = {
  Map: Map,
  Date,
  Array,
  Mixed,
  Buffer,
  String,
  Number,
  Boolean,
  ObjectId,
  Decimal128,
};

module.exports = (schema) => {
  const schemaKeys = Object.keys(schema);

  const modifiedSchema = schemaKeys.reduce((obj, key) => {
    obj[key] = { // eslint-disable-line no-param-reassign
      ...schema[key],
      type: mongooseSchemaTypes[schema[key].type],
      ...(schema[key].of && {
        of: mongooseSchemaTypes[schema[key].of],
      }),
    };

    return obj;
  }, {});

  return modifiedSchema;
};
