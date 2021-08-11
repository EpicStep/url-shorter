const { log } = require('./logger');

/**
 * Init connect to the database.
 * @param {object} mongoose - database object.
 * @param {string} url - mongoDB url.
 * @param {?function} onConnect - mongoDB url.
 */

module.exports = (mongoose, url, onConnect) => {
  const db = mongoose.connection;
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

  db.on('error', (err) => {
    log('error', `Failed to connect. Error: ${err}`);

    process.exit(1);
  });

  db.on('connected', () => {
    if (onConnect != null) onConnect();

    log('debug', 'Connected to the database.');
  });
};
