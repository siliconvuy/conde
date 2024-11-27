const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');

function removeEnv(envName) {
  try {
    const envPath = path.join(CONFIG.envsDir, envName);

    // Check if environment exists
    if (!fs.existsSync(envPath)) {
      logger.error(`Environment '${envName}' does not exist.`);
      process.exit(1);
    }

    // Check if environment is currently active
    if (process.env.CONDE_ENV === envName) {
      logger.error(`Cannot remove active environment. Please deactivate '${envName}' first.`);
      process.exit(1);
    }

    // Remove the environment directory
    fs.removeSync(envPath);
    logger.success(`Environment '${envName}' removed successfully.`);
  } catch (error) {
    logger.error(`Failed to remove environment '${envName}': ${error.message}`);
    process.exit(1);
  }
}

module.exports = removeEnv; 