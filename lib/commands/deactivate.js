const logger = require('../utils/logger');

function deactivateEnv() {
  try {
    if (!process.env.CONDE_ENV) {
      logger.warning('No environment is currently active.');
      return;
    }

    // Remove the environment from PATH
    const envBinPath = `${process.env.CONDE_ENV}/bin:`;
    process.env.PATH = process.env.PATH.replace(envBinPath, '');

    // Unset the environment variable
    delete process.env.CONDE_ENV;

    logger.success('Environment deactivated.');
  } catch (error) {
    logger.error(`Failed to deactivate environment: ${error.message}`);
    process.exit(1);
  }
}

module.exports = deactivateEnv;

