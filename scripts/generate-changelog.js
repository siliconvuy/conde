const fs = require('fs-extra');
const { execSync } = require('child_process');

async function generateChangelog() {
    const version = process.env.VERSION;
    if (!version) {
        console.error('No version specified');
        process.exit(1);
    }

    // Si es el primer release, usar un mensaje especial
    const changelog = `# Release v${version}

## Changes

- Zero-dependency installation - no Node.js required
- Environment management system
- Package installation with dependency resolution
- Shell integration and PATH management
- Node.js version management per environment

## Installation

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/siliconvuy/conde/main/scripts/install.sh | bash
\`\`\`

For more information, visit: https://github.com/siliconvuy/conde
`;

    await fs.writeFile('CHANGELOG.md', changelog);
}

generateChangelog().catch(console.error); 