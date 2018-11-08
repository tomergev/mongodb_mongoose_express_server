const mongoose = require('mongoose');
const { blockSchema } = require('../schemas/');

const BlockSchema = new mongoose.Schema(
  blockSchema,
  { timestamps: true },
);

const Block = mongoose.model('blocks', BlockSchema);

module.exports = Block;
