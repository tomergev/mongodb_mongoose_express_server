const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
// Creating the database and collections
require('./db')();

const app = express();
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const http = require('http').Server(app);
const routes = require('./routes/');

const routeKeys = Object.keys(routes);

routeKeys.forEach((key) => {
  app.use(`/${key}`, routes[key]);
});

http.listen(3030, () => {
  console.log('Magic happening on port 3030');
});

module.exports = app;
