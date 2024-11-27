const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');

function listEnvs() {
  try {
    const envs = fs.readdirSync(CONFIG.envsDir);
    if (envs.length === 0) {
      logger.info('No environments found.');
      return;
    }

    logger.info('Available environments:');
    envs.forEach(env => {
      if (env === process.env.CONDE_ENV) {
        console.log(`  - ${env} (active)`);
      } else {
        console.log(`  - ${env}`);
      }
    });
  } catch (error) {
    logger.error(`Failed to list environments: ${error.message}`);
    process.exit(1);
  }
}

function listPackages() {
  try {
    const currentEnv = process.env.CONDE_ENV;
    if (!currentEnv) {
      logger.error("No active environment. Use 'conde activate <env>' to activate an environment.");
      process.exit(1);
    }

    const nodeModulesPath = path.join(CONFIG.envsDir, currentEnv, 'lib', 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      logger.info(`No packages installed in environment '${currentEnv}'.`);
      return;
    }

    const packages = fs.readdirSync(nodeModulesPath).filter(pkg => pkg !== '.bin');

    if (packages.length === 0) {
      logger.info(`No packages installed in environment '${currentEnv}'.`);
      return;
    }

    logger.info(`Packages installed in '${currentEnv}':`);
    packages.forEach(pkg => {
      console.log(`  - ${pkg}`);
    });
  } catch (error) {
    logger.error(`Failed to list packages: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  envs: listEnvs,
  packages: listPackages
};

