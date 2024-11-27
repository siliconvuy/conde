const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');

function activateEnv(envName) {
  try {
    const envPath = path.join(CONFIG.envsDir, envName);
    if (!fs.existsSync(envPath)) {
      logger.error(`Environment '${envName}' does not exist.`);
      process.exit(1);
    }

    // Set environment variables
    process.env.CONDE_ENV = envName;
    process.env.PATH = path.join(envPath, 'bin') + ':' + process.env.PATH;

    logger.success(`Environment '${envName}' activated.`);
  } catch (error) {
    logger.error(`Failed to activate environment '${envName}': ${error.message}`);
    process.exit(1);
  }
}

module.exports = activateEnv;

