const chalk = require('chalk');

const logger = {
  info: (message) => {
    console.log(chalk.blue('[Conde]'), message);
  },
  error: (message) => {
    console.error(chalk.red('[Conde ERROR]'), message);
  },
  success: (message) => {
    console.log(chalk.green('[Conde]'), message);
  },
  warning: (message) => {
    console.warn(chalk.yellow('[Conde WARN]'), message);
  },
  formatSuccess: (message) => {
    return chalk.green(message);
  }
};

module.exports = logger;

