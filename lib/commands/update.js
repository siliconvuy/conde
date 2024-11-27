const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');
const semver = require('semver');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');
const downloader = require('../utils/downloader');

async function updateConde() {
    try {
        logger.info('Checking for Conde updates...');

        // Obtener la versión actual de Conde
        const currentVersion = JSON.parse(
            await fs.readFile(path.join(CONFIG.baseDir, 'package.json'), 'utf8')
        ).version;

        // Obtener información de la última versión
        const releasesResponse = await axios.get(CONFIG.releasesUrl);
        const latestVersion = releasesResponse.data.latest;

        if (semver.gt(latestVersion, currentVersion)) {
            logger.info(`New version available: ${latestVersion} (current: ${currentVersion})`);
            logger.info('Downloading update...');

            // Crear directorio temporal
            const tempDir = path.join(CONFIG.baseDir, '.temp');
            await fs.ensureDir(tempDir);

            try {
                // Descargar nueva versión
                const release = releasesResponse.data.releases.find(r => r.version === latestVersion);
                const tarballPath = path.join(tempDir, 'conde.tar.gz');
                await downloader.downloadFile(release.url, tarballPath);

                // Extraer y actualizar archivos
                logger.info('Installing update...');
                execSync(`tar -xzf ${tarballPath} -C ${tempDir}`);

                // Backup de archivos importantes
                const backupDir = path.join(CONFIG.baseDir, '.backup');
                await fs.ensureDir(backupDir);
                await fs.copy(CONFIG.baseDir, backupDir, {
                    filter: src => !src.includes('node_modules') && !src.includes('.temp')
                });

                try {
                    // Copiar nuevos archivos
                    await fs.copy(path.join(tempDir, 'conde'), CONFIG.baseDir, {
                        overwrite: true,
                        filter: src => !src.includes('node_modules')
                    });

                    // Actualizar dependencias si es necesario
                    execSync('npm install --production', {
                        cwd: CONFIG.baseDir,
                        stdio: 'inherit'
                    });

                    logger.success(`Conde updated to version ${latestVersion}`);
                    logger.info('Changes in this version:');
                    release.changes.forEach(change => logger.info(`- ${change}`));
                    logger.info('Please restart your shell to apply changes');
                } catch (error) {
                    // Restaurar backup en caso de error
                    logger.error('Error during update, restoring backup...');
                    await fs.copy(backupDir, CONFIG.baseDir, { overwrite: true });
                    throw error;
                }
            } finally {
                // Limpiar archivos temporales
                await fs.remove(tempDir);
                await fs.remove(path.join(CONFIG.baseDir, '.backup'));
            }
        } else {
            logger.info('Conde is already up to date.');
        }

        // Actualizar entorno activo si existe
        if (process.env.CONDE_ENV) {
            const envPath = path.join(CONFIG.envsDir, process.env.CONDE_ENV);
            logger.info(`Updating packages in environment '${process.env.CONDE_ENV}'...`);
            
            // Actualizar paquetes del entorno
            execSync(`npm update --prefix "${envPath}"`, { stdio: 'inherit' });
            logger.success('Environment packages updated successfully');
        }
    } catch (error) {
        logger.error(`Update failed: ${error.message}`);
        process.exit(1);
    }
}

module.exports = updateConde;

