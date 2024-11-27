const path = require('path');
const os = require('os');

const CONFIG = {
  baseDir: path.join(os.homedir(), '.conde'),
  binDir: path.join(os.homedir(), '.conde', 'bin'),
  envsDir: path.join(os.homedir(), '.conde', 'envs'),
  packagesDir: path.join(os.homedir(), '.conde', 'packages'),
  pkginfoDir: path.join(os.homedir(), '.conde', 'pkginfo'),
  libDir: path.join(os.homedir(), '.conde', 'lib'),
  releasesUrl: 'https://raw.githubusercontent.com/siliconvuy/conde/main/releases.json',
  nodeVersionsUrl: 'https://nodejs.org/dist/index.json',
  updateUrl: 'https://github.com/siliconvuy/conde/releases/download'
};

module.exports = CONFIG;

