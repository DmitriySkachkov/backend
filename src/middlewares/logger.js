// Simple request logger: method + original URL
const logger = (req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};

module.exports = logger;

