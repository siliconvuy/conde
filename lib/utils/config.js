const path = require('path');
const os = require('os');

const CONFIG = {
  baseDir: path.join(os.homedir(), '.conde'),
  binDir: path.join(os.homedir(), '.conde', 'bin'),
  envsDir: path.join(os.homedir(), '.conde', 'envs'),
  packagesDir: path.join(os.homedir(), '.conde', 'packages'),
  releasesUrl: 'https://raw.githubusercontent.com/your-username/conde/main/releases.json'
};

module.exports = CONFIG;

