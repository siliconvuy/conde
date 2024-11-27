const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');

function installPackage(pkgName) {
  try {
    const currentEnv = process.env.CONDE_ENV;
    if (!currentEnv) {
      logger.error("No active environment. Use 'conde activate <env>' to activate an environment.");
      process.exit(1);
    }

    const envPath = path.join(CONFIG.envsDir, currentEnv);
    const nodeModulesPath = path.join(envPath, 'lib', 'node_modules');

    // Ensure node_modules directory exists
    fs.mkdirpSync(nodeModulesPath);

    logger.info(`Installing package '${pkgName}' in environment '${currentEnv}'...`);
    execSync(`npm install -g ${pkgName} --prefix "${envPath}"`, { stdio: 'inherit' });

    logger.success(`Package '${pkgName}' installed successfully in '${currentEnv}'.`);
  } catch (error) {
    logger.error(`Failed to install package '${pkgName}': ${error.message}`);
    process.exit(1);
  }
}

module.exports = installPackage;

