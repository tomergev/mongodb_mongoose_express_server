const faker = require('faker');
const mongoose = require('mongoose');
const fakegoose = require('fakegoose');

const nodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      fake: 'random.word',
    },
    type: {
      type: String,
      fake: () => faker.random.arrayElement([
        'Geth',
        'Parity',
        'Parity-Ethereum',
      ]),
    },
    location: {
      type: String,
      fake: 'address.country',
      // fake: 'address.countryCode',
    },
    isMining: {
      type: Boolean,
      fake: 'random.boolean',
    },
    latency: {
      type: Number,
      fake: () => faker.random.number({ min: 1, max: 200 }),
    },
    peers: {
      type: Number,
      fake: () => faker.random.number({ min: 1, max: 500 }),
    },
    pendingTransactions: {
      type: Number,
      fake: () => faker.random.number({ min: 0, max: 9999 }),
    },
    totalDifficulty: {
      type: Number,
      fake: () => faker.random.number({
        min: 7.670156638558714e+21,
        max: 7.696296824810617e+21,
      }),
    },
    uncles: {
      type: Number,
      fake: () => faker.random.number({ min: 0, max: 1 }),
    },
    propagationTimeAverage: {
      type: Number,
      fake: () => faker.random.number({ min: 50, max: 2000 }),
    },
  },
  {
    timestamps: true,
  },
);

nodeSchema.plugin(fakegoose);
const Node = mongoose.model('nodes', nodeSchema);
Node.seed(20, true, console.log); // eslint-disable-line no-console

module.exports = Node;
