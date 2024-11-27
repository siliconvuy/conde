#!/usr/bin/env node

const { Command } = require('commander');
const conde = require('../lib/conde');
const packageJson = require('../package.json');

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

// Add other commands here (activate, deactivate, install, list, clean, update, version)

program.parse(process.argv);

