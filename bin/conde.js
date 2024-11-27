#!/usr/bin/env node

const { Command } = require('commander');
const conde = require('../lib/conde');
const { readFileSync } = require('fs');
const path = require('path');

// Leer package.json para la versión
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../package.json'))
);

const program = new Command();

program
  .name('conde')
  .description('A Node.js environment manager inspired by Conda.')
  .version(packageJson.version);

program
  .command('create <envName>')
  .description('Create a new Conde environment.')
  .option('--node <version>', 'Specify Node.js version', '18.14.0')
  .action((envName, options) => {
    conde.create(envName, options.node);
  });

program
  .command('activate <envName>')
  .description('Activate an existing Conde environment.')
  .action((envName) => {
    conde.activate(envName);
  });

program
  .command('deactivate')
  .description('Deactivate the current Conde environment.')
  .action(() => {
    conde.deactivate();
  });

program
  .command('install [packageName]')
  .description('Install packages in the active environment.')
  .option('--from-package-json <file>', 'Install dependencies from package.json')
  .action((packageName, options) => {
    if (options.fromPackageJson) {
      conde.install(options.fromPackageJson, { fromPackageJson: true });
    } else if (packageName) {
      conde.install(packageName);
    } else {
      // Si no se proporciona packageName ni --from-package-json, usar ./package.json
      conde.install('./package.json', { fromPackageJson: true });
    }
  });

program
  .command('list [type]')
  .description('List environments or packages.')
  .action((type) => {
    if (type === 'envs') {
      conde.listEnvs();
    } else if (type === 'packages') {
      conde.listPackages();
    } else {
      console.log("Please specify 'envs' or 'packages' to list.");
    }
  });

program
  .command('clean')
  .description('Clean unused packages from global store.')
  .action(() => {
    conde.clean();
  });

program
  .command('update')
  .description('Update Conde and packages in active environment.')
  .action(() => {
    conde.update();
  });

program
  .command('version')
  .description('Show current Conde version.')
  .action(() => {
    conde.version();
  });

program
  .command('remove <envName>')
  .description('Remove a Conde environment.')
  .action((envName) => {
    conde.remove(envName);
  });

program.parse(process.argv);

