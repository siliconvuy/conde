const path = require('path');
const fs = require('fs-extra');
const logger = require('./utils/logger');
const config = require('./utils/config');
const downloader = require('./utils/downloader');
const versionManager = require('./utils/versionManager');

// Import command modules
const createEnv = require('./commands/create');
const activateEnv = require('./commands/activate');
const deactivateEnv = require('./commands/deactivate');
const installPackage = require('./commands/install');
const listEnvs = require('./commands/list').envs;
const listPackages = require('./commands/list').packages;
const cleanPackages = require('./commands/clean');
const updateConde = require('./commands/update');
const showVersion = require('./commands/version');
const removeEnv = require('./commands/remove');

const conde = {
  create: createEnv,
  activate: activateEnv,
  deactivate: deactivateEnv,
  install: installPackage,
  listEnvs: listEnvs,
  listPackages: listPackages,
  clean: cleanPackages,
  update: updateConde,
  version: showVersion,
  remove: removeEnv
};

module.exports = conde;

