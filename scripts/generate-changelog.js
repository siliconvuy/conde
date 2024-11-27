const fs = require('fs-extra');
const { execSync } = require('child_process');

async function generateChangelog() {
    const version = process.env.VERSION;
    if (!version) {
        console.error('No version specified');
        process.exit(1);
    }

    // Get commits since last tag
    const lastTag = execSync('git describe --tags --abbrev=0 HEAD^', { encoding: 'utf8' }).trim();
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"- %s"`, { encoding: 'utf8' });

    const changelog = `# Release v${version}

## Changes

${commits}

## Installation

\`\`\`bash
npm install -g conde
# or
curl -fsSL https://raw.githubusercontent.com/siliconvuy/conde/main/scripts/install.sh | bash
\`\`\`

For more information, visit: https://github.com/siliconvuy/conde
`;

    await fs.writeFile('CHANGELOG.md', changelog);
}

generateChangelog().catch(console.error); 