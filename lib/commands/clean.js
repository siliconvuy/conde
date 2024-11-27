const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');

function clean() {
  try {
    logger.info('Cleaning unused packages from global store...');

    const globalPackagesPath = CONFIG.packagesDir;
    const usedPackages = new Set();

    // Iterate through all environments and collect used packages
    const envs = fs.readdirSync(CONFIG.envsDir);
    envs.forEach(env => {
      const nodeModulesPath = path.join(CONFIG.envsDir, env, 'lib', 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        const packages = fs.readdirSync(nodeModulesPath).filter(pkg => pkg !== '.bin');
        packages.forEach(pkg => usedPackages.add(pkg));
      }
    });

    // Iterate through global packages and remove unused ones
    const globalPackages = fs.readdirSync(globalPackagesPath).filter(pkg => pkg !== '.bin');
    let removedCount = 0;

    globalPackages.forEach(pkg => {
      if (!usedPackages.has(pkg)) {
        const pkgPath = path.join(globalPackagesPath, pkg);
        fs.removeSync(pkgPath);
        logger.info(`Removed unused package: ${pkg}`);
        removedCount++;
      }
    });

    if (removedCount === 0) {
      logger.info('No unused packages found.');
    } else {
      logger.success(`Cleaned ${removedCount} unused package(s).`);
    }
  } catch (error) {
    logger.error(`Failed to clean packages: ${error.message}`);
    process.exit(1);
  }
}

module.exports = clean;

