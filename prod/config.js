const dbConfig = require('./db/config.js');

const config = {
  app: {
    port: 3000
  },
  db: dbConfig,
  token: {
    secretKey: 'supersecret',
    expiration: 60 * 60 * 24 * 31  // 1 month
  }
};

module.exports = config;