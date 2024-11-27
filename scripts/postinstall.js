const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const CONDE_DIR = path.join(os.homedir(), '.conde');
const dirs = [
  path.join(CONDE_DIR, 'bin'),
  path.join(CONDE_DIR, 'envs'),
  path.join(CONDE_DIR, 'packages'),
  path.join(CONDE_DIR, 'scripts')
];

// Create necessary directories
dirs.forEach(dir => {
  fs.mkdirpSync(dir);
  console.log(`Created directory: ${dir}`);
});

// Copy conde.sh to the scripts directory
const sourceShell = path.join(__dirname, 'conde.sh');
const targetShell = path.join(CONDE_DIR, 'scripts', 'conde.sh');
fs.copyFileSync(sourceShell, targetShell);
fs.chmodSync(targetShell, '755');
console.log('Installed shell integration script');

// Set executable permissions
fs.chmodSync(path.join(__dirname, '../bin/conde.js'), '755');
console.log('Set executable permissions for conde.js');

// Create version file
fs.writeFileSync(path.join(CONDE_DIR, 'version'), '1.0.0');
console.log('Initialized Conde version file');

// Add shell integration instructions
console.log('\nTo complete installation, add this to your ~/.bashrc or ~/.zshrc:');
console.log('\n# Conde initialization');
console.log('source ~/.conde/scripts/conde.sh\n');
console.log('Then restart your shell or run: source ~/.bashrc (or ~/.zshrc for Zsh)\n'); 