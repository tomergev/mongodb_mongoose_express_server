const {
  format,
  transports,
  createLogger,
} = require('winston');

const {
  json,
  combine,
  timestamp,
  prettyPrint,
} = format;

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: 'src/logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const ignorePrivate = format((info) => {
  if (info.private) return false;
  return info;
});

// instantiate a new Winston Logger with the settings defined above
const logger = createLogger({
  format: combine(
    json(),
    timestamp(),
    prettyPrint(),
    ignorePrivate(),
  ),
  transports: [
    new transports.File(options.file),
    new transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write(message) {
    // use the 'info' log level so the output will be picked up by both transports (file & console)
    logger.info(message);
  },
};

module.exports = logger;
