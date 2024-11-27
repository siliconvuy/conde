const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');
const downloader = require('../utils/downloader');

async function createEnv(envName, nodeVersion) {
  try {
    const envPath = path.join(CONFIG.envsDir, envName);
    if (fs.existsSync(envPath)) {
      logger.error(`Environment '${envName}' already exists.`);
      process.exit(1);
    }

    logger.info(`Creating environment '${envName}' with Node.js ${nodeVersion}...`);
    fs.mkdirpSync(path.join(envPath, 'bin'));

    // Download Node.js for the environment
    const OS = process.platform === 'darwin' ? 'darwin' : process.platform;
    const ARCH = process.arch === 'x64' ? 'x64' : (process.arch === 'arm64' ? 'arm64' : process.arch);
    const NODE_TARBALL = `node-v${nodeVersion}-${OS}-${ARCH}.tar.xz`;
    const NODE_URL = `https://nodejs.org/dist/v${nodeVersion}/${NODE_TARBALL}`;
    const tempPath = path.join('/tmp', NODE_TARBALL);

    logger.info(`Downloading Node.js from ${NODE_URL}...`);
    await downloader.downloadFile(NODE_URL, tempPath);

    logger.info(`Extracting Node.js...`);
    const { execSync } = require('child_process');
    execSync(`tar -xf ${tempPath} -C /tmp`);

    const extractedDir = path.join('/tmp', `node-v${nodeVersion}-${OS}-${ARCH}`);
    logger.info(`Installing Node.js to environment...`);
    fs.copySync(extractedDir, envPath);

    // Cleanup
    fs.removeSync(tempPath);
    fs.removeSync(extractedDir);

    // Save Node.js version in the environment
    fs.writeFileSync(path.join(envPath, 'node_version'), nodeVersion, 'utf-8');

    logger.success(`Environment '${envName}' created successfully.`);
  } catch (error) {
    logger.error(`Failed to create environment '${envName}': ${error.message}`);
    process.exit(1);
  }
}

module.exports = createEnv;

