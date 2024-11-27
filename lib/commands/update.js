const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');
const versionManager = require('../utils/versionManager');
const downloader = require('../utils/downloader');
const semver = require('semver');

async function updateConde() {
  try {
    logger.info('Checking for Conde updates...');

    // Download releases.json
    const releasesResponse = await axios.get(CONFIG.releasesUrl);
    const releases = releasesResponse.data.releases;

    // Get the latest release
    const latestRelease = releases[releases.length - 1];
    const latestCondeVersion = latestRelease.conde_version;
    const latestNodeVersion = latestRelease.node_version;

    const currentCondeVersion = versionManager.getCurrentCondeVersion();

    if (semver.lt(currentCondeVersion, latestCondeVersion)) {
      logger.info(`New Conde version available: ${latestCondeVersion} (current: ${currentCondeVersion})`);
      logger.info('Updating Conde...');

      // Download the new conde.js script
      const newCondeScriptUrl = 'https://raw.githubusercontent.com/your-username/conde/main/lib/conde.js';
      const tempScriptPath = '/tmp/conde.js';
      await downloader.downloadFile(newCondeScriptUrl, tempScriptPath);

      // Replace the existing conde.js
      fs.copySync(tempScriptPath, path.join(CONFIG.baseDir, 'conde.js'), { overwrite: true });
      fs.removeSync(tempScriptPath);

      // Update the version file
      versionManager.setCondeVersion(latestCondeVersion);

      logger.success(`Conde updated to version ${latestCondeVersion}.`);
    } else {
      logger.info('Conde is already up to date.');
    }

    // Update packages in the active environment
    const currentEnv = process.env.CONDE_ENV;
    if (currentEnv) {
      const envPath = path.join(CONFIG.envsDir, currentEnv);
      logger.info(`Updating packages in environment '${currentEnv}'...`);
      execSync(`npm update -g --prefix "${envPath}"`, { stdio: 'inherit' });
      logger.success(`Packages in environment '${currentEnv}' updated successfully.`);

      // Check if a new Node.js version is available
      const envNodeVersionPath = path.join(envPath, 'node_version');
      if (fs.existsSync(envNodeVersionPath)) {
        const envNodeVersion = fs.readFileSync(envNodeVersionPath, 'utf-8').trim();
        if (semver.lt(envNodeVersion, latestNodeVersion)) {
          logger.info(`New Node.js version available: ${latestNodeVersion} (current: ${envNodeVersion})`);
          // Prompt user to update Node.js in the environment
          const inquirer = require('inquirer');
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'updateNode',
              message: `Do you want to update Node.js in the active environment '${currentEnv}' to version ${latestNodeVersion}?`,
              default: false
            }
          ]);

          if (answers.updateNode) {
            // Update Node.js in the environment
            logger.info(`Updating Node.js to version ${latestNodeVersion} in environment '${currentEnv}'...`);

            // Download and install new Node.js
            const OS = process.platform === 'darwin' ? 'darwin' : process.platform;
            const ARCH = process.arch === 'x64' ? 'x64' : (process.arch === 'arm64' ? 'arm64' : process.arch);
            const NODE_TARBALL = `node-v${latestNodeVersion}-${OS}-${ARCH}.tar.xz`;
            const NODE_URL = `https://nodejs.org/dist/v${latestNodeVersion}/${NODE_TARBALL}`;
            const tempPath = `/tmp/${NODE_TARBALL}`;

            await downloader.downloadFile(NODE_URL, tempPath);
            logger.info('Extracting Node.js...');
            execSync(`tar -xf ${tempPath} -C /tmp`);

            const extractedDir = path.join('/tmp', `node-v${latestNodeVersion}-${OS}-${ARCH}`);
            logger.info('Installing new Node.js...');
            fs.copySync(extractedDir, envPath, { overwrite: true });

            // Cleanup
            fs.removeSync(tempPath);
            fs.removeSync(extractedDir);

            // Update Node.js version in the environment
            fs.writeFileSync(path.join(envPath, 'node_version'), latestNodeVersion, 'utf-8');

            logger.success(`Node.js updated to version ${latestNodeVersion} in environment '${currentEnv}'.`);
          }
        } else {
          logger.info('Node.js is already up to date in the active environment.');
        }
      }
    }

  } catch (error) {
    logger.error(`Failed to update Conde: ${error.message}`);
    process.exit(1);
  }
}

module.exports = updateConde;

