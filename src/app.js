const cors = require('cors');
// const morgan = require('morgan');
const express = require('express');
const jwt = require('express-jwt');
const bodyParser = require('body-parser');
const compression = require('compression');
require('dotenv').config({ path: './.env' });
const createDb = require('./db');
const routes = require('./routes/');
const config = require('./config/');
// const winston = require('./utils/winston/');

const app = express();
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(morgan('combined', {
//   stream: winston.stream,
//   // Only logging error messages
//   skip: (_req, res) => res.statusCode < 399,
// }));

app.use(
  jwt({ secret: config.jwt.secret }).unless({
    path: [
      '/auth/signup',
      '/auth/login',
    ],
  }),
);

const routeKeys = Object.keys(routes);

routeKeys.forEach((key) => {
  app.use(`/${key}`, routes[key]);
});

// Must include the next parameter for express to know that this is the error handling function
const errorHandling = (err, _req, res, _next) => {
  // winston.error(err);

  res.status(err.status || 400).send({
    message: err.message,
    error: err,
  });
};
app.use(errorHandling);

app.listen(3030, (err) => {
  if (err) {
    // winston.error(err);
    // https://stackoverflow.com/questions/43147330/what-is-difference-between-method-process-exit1-and-process-exit0-in-node-js
    process.exit(1);
  }

  console.log('Magic happening on port 3030');
  createDb();
});

module.exports = app;
