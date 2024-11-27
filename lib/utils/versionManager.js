const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('./config');
const logger = require('./logger');

const versionManager = {
  getCurrentCondeVersion: () => {
    const versionPath = path.join(CONFIG.baseDir, 'version');
    if (fs.existsSync(versionPath)) {
      return fs.readFileSync(versionPath, 'utf-8').trim();
    }
    return '0.0.0';
  },
  setCondeVersion: (version) => {
    const versionPath = path.join(CONFIG.baseDir, 'version');
    fs.writeFileSync(versionPath, version, 'utf-8');
  }
};

module.exports = versionManager;

