const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');

function listEnvs() {
  try {
    const envs = fs.readdirSync(CONFIG.envsDir)
      .filter(item => {
        const fullPath = path.join(CONFIG.envsDir, item);
        return !item.startsWith('.') && fs.statSync(fullPath).isDirectory();
      });

    if (envs.length === 0) {
      logger.info('No environments found.');
      return;
    }

    logger.info('Available environments:');
    envs.forEach(env => {
      const envPath = path.join(CONFIG.envsDir, env);
      const nodeVersionFile = path.join(envPath, 'node_version');
      let nodeVersion = '';
      
      if (fs.existsSync(nodeVersionFile)) {
        nodeVersion = fs.readFileSync(nodeVersionFile, 'utf-8').trim();
      }

      const isActive = env === process.env.CONDE_ENV;
      const activeMarker = isActive ? '* ' : '  ';
      const envInfo = nodeVersion ? 
        `${activeMarker}- ${env} (node-${nodeVersion})` : 
        `${activeMarker}- ${env}`;

      if (isActive) {
        console.log(logger.formatSuccess(envInfo));
      } else {
        console.log(envInfo);
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

    const packages = fs.readdirSync(nodeModulesPath)
      .filter(pkg => !pkg.startsWith('.') && pkg !== '.bin');

    if (packages.length === 0) {
      logger.info(`No packages installed in environment '${currentEnv}'.`);
      return;
    }

    logger.info(`Packages installed in '${currentEnv}':`);
    packages.forEach(pkg => {
      const pkgJsonPath = path.join(nodeModulesPath, pkg, 'package.json');
      let version = '';
      
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = fs.readJsonSync(pkgJsonPath);
        version = pkgJson.version;
      }

      console.log(`  - ${pkg}${version ? ` (${version})` : ''}`);
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

