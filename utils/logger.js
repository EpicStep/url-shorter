/**
 * @type {object | undefined} value | log instance.
 */

let logInstance;

/**
 * Add a log instance.
 * @param {object} instance - log instance.
 */

const addInstance = (instance) => {
  logInstance = instance;
};

/**
 * Logger.
 * @param {'error' | 'info' | 'warn' | 'fatal' | 'trace' | 'debug'} level - log level.
 * @param {string} str - log text.
 */

const log = (level, str) => {
  logInstance.log[level](str);
};

module.exports = { log, addInstance };
