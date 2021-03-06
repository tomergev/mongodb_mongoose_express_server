const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const collections = require('./models/');
const {
  winstonLogger,
  winstonErrorLogging,
} = require('./config/winston');
const { blockListener } = require('./services/ethers/');
const { createAllAccounts } = require('./helpers/accounts/');
const { restartTransactionSeries } = require('./helpers/transactions/');

const ipAddress = `mongodb://${process.env.IP_ADDRESS}`;
const mongoDbUrl = `${ipAddress}:27017`;
const mongoConnectOptions = {
  useNewUrlParser: true,
};

// Creating the database and collections
module.exports = () => {
  MongoClient.connect(mongoDbUrl, mongoConnectOptions, async (mongoConnectErr, client) => {
    if (mongoConnectErr) {
      winstonErrorLogging(mongoConnectErr);
      throw mongoConnectErr;
    }

    winstonLogger('Database created!');

    const dbName = 'whiteblock';
    const whiteblock = client.db(dbName);

    collections.forEach((collection) => {
      whiteblock.createCollection(collection, (err) => {
        if (err) winstonErrorLogging(err);
      });
    });

    // Connecting mongoose to the db
    const mongooseUrl = `${ipAddress}/${dbName}`;
    mongoose.connect(mongooseUrl, {
      // Using these options because of this post; https://github.com/Automattic/mongoose/issues/6890#issuecomment-416410444
      useCreateIndex: true,
      useNewUrlParser: true,
    });

    // Listening and recording new blocks in DB & creating all accounts
    blockListener();
    await createAllAccounts().catch(winstonErrorLogging);
    restartTransactionSeries();

    client.close();
  });
};
