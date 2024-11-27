const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function packRelease() {
    const version = process.argv[2] || process.env.VERSION;
    if (!version) {
        console.error('Please provide a version number');
        process.exit(1);
    }

    // Generar CHANGELOG
    await require('./generate-changelog');

    const releaseDir = path.join(__dirname, '../release');
    const distDir = path.join(releaseDir, 'conde');

    // Limpiar directorio de release
    await fs.remove(releaseDir);
    await fs.ensureDir(distDir);

    // Copiar archivos necesarios
    const filesToCopy = [
        'bin',
        'lib',
        'scripts',
        'package.json',
        'package-lock.json',
        'README.md',
        'LICENSE',
        'CHANGELOG.md'
    ];

    for (const file of filesToCopy) {
        await fs.copy(
            path.join(__dirname, '..', file),
            path.join(distDir, file)
        );
    }

    // Crear tarball
    execSync(`cd ${releaseDir} && tar -czf conde-${version}.tar.gz conde`);
    console.log(`Release package created at: ${releaseDir}/conde-${version}.tar.gz`);
}

packRelease().catch(console.error); 