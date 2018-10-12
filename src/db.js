const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const collections = require('./models/');

const ipAddress = 'mongodb://127.0.0.1';
const mongoDbUrl = `${ipAddress}:27017`;
const options = {
  useNewUrlParser: true,
};

// Creating the database and collections
module.exports = () => {
  MongoClient.connect(mongoDbUrl, options, async (mongoConnectErr, client) => {
    if (mongoConnectErr) throw mongoConnectErr;
    console.log('Database created!');

    const dbName = 'whiteblock';
    const whiteblock = client.db(dbName);

    await Promise.all(
      collections.map(collection => new Promise((resolve) => {
        whiteblock.createCollection(collection, (createCollectionErr, res) => {
          resolve(createCollectionErr || res);
        });
      })),
    );

    // Connecting mongoose to the db
    const mongooseUrl = `${ipAddress}/${dbName}`;
    mongoose.connect(mongooseUrl);

    client.close();
  });
};
