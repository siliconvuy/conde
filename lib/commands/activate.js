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

    // Check if shell integration is available
    const shellScript = path.join(CONFIG.baseDir, 'scripts', 'conde.sh');
    if (!fs.existsSync(shellScript)) {
      logger.error('Shell integration not found. Please ensure Conde is installed correctly.');
      logger.info('Add to your ~/.bashrc or ~/.zshrc:');
      logger.info('source ~/.conde/scripts/conde.sh');
      process.exit(1);
    }

    // Set environment variables
    process.env.CONDE_ENV = envName;
    process.env.PATH = path.join(envPath, 'bin') + ':' + process.env.PATH;

    logger.success(`Environment '${envName}' activated.`);
    logger.info('Note: For shell integration, use: source $(which conde) activate ' + envName);
  } catch (error) {
    logger.error(`Failed to activate environment '${envName}': ${error.message}`);
    process.exit(1);
  }
}

module.exports = activateEnv;

