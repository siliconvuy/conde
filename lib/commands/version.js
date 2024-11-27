const versionManager = require('../utils/versionManager');
const logger = require('../utils/logger');

function showVersion() {
  try {
    const version = versionManager.getCurrentCondeVersion();
    logger.info(`Conde version: ${version}`);
  } catch (error) {
    logger.error(`Failed to retrieve Conde version: ${error.message}`);
    process.exit(1);
  }
}

module.exports = showVersion;

