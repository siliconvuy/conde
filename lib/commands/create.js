const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const semver = require('semver');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');
const downloader = require('../utils/downloader');

async function getLatestNodeVersion(version) {
    try {
        // Si la versión ya es completa (x.y.z), usarla directamente
        if (version.split('.').length === 3) {
            return version;
        }

        // Obtener la lista de versiones de Node.js
        const response = await fetch('https://nodejs.org/dist/index.json');
        const versions = await response.json();

        // Filtrar versiones que coincidan con el prefijo dado
        const matchingVersions = versions
            .map(v => v.version.replace('v', ''))
            .filter(v => v.startsWith(version));

        if (matchingVersions.length === 0) {
            throw new Error(`No Node.js version found matching ${version}`);
        }

        // Ordenar versiones y obtener la más reciente
        return matchingVersions.sort(semver.rcompare)[0];
    } catch (error) {
        throw new Error(`Failed to get Node.js version: ${error.message}`);
    }
}

async function createEnv(envName, nodeVersion) {
    const envPath = path.join(CONFIG.envsDir, envName);
    let tempFiles = [];

    try {
        // Verificar si el entorno ya existe
        if (fs.existsSync(envPath)) {
            // Si el directorio está vacío o incompleto, eliminarlo
            const contents = fs.readdirSync(envPath);
            if (contents.length === 0 || !contents.includes('bin')) {
                logger.warning(`Found incomplete environment '${envName}', cleaning up...`);
                await fs.remove(envPath);
            } else {
                logger.error(`Environment '${envName}' already exists.`);
                process.exit(1);
            }
        }

        // Obtener la versión completa de Node.js
        const fullNodeVersion = await getLatestNodeVersion(nodeVersion);
        logger.info(`Creating environment '${envName}' with Node.js ${fullNodeVersion}...`);

        // Crear estructura de directorios
        await fs.ensureDir(envPath);
        await fs.ensureDir(path.join(envPath, 'bin'));
        await fs.ensureDir(path.join(envPath, 'lib', 'node_modules'));

        // Construir URLs y nombres de archivo
        const OS = process.platform === 'darwin' ? 'darwin' : process.platform;
        const ARCH = process.arch === 'x64' ? 'x64' : (process.arch === 'arm64' ? 'arm64' : process.arch);
        const NODE_TARBALL = `node-v${fullNodeVersion}-${OS}-${ARCH}.tar.xz`;
        const NODE_URL = `https://nodejs.org/dist/v${fullNodeVersion}/${NODE_TARBALL}`;
        const tempPath = path.join('/tmp', NODE_TARBALL);
        tempFiles.push(tempPath);

        // Descargar Node.js
        logger.info(`Downloading Node.js from ${NODE_URL}...`);
        await downloader.downloadFile(NODE_URL, tempPath);

        // Extraer Node.js
        logger.info('Extracting Node.js...');
        execSync(`tar -xf ${tempPath} -C /tmp`);
        const extractedDir = path.join('/tmp', `node-v${fullNodeVersion}-${OS}-${ARCH}`);
        tempFiles.push(extractedDir);

        // Copiar archivos de Node.js
        await fs.copy(extractedDir, envPath);

        // Guardar la versión de Node.js
        await fs.writeFile(path.join(envPath, 'node_version'), fullNodeVersion);

        logger.success(`Environment '${envName}' created successfully with Node.js ${fullNodeVersion}`);
    } catch (error) {
        // Limpiar en caso de error
        if (fs.existsSync(envPath)) {
            await fs.remove(envPath);
        }
        // Limpiar archivos temporales
        for (const file of tempFiles) {
            if (fs.existsSync(file)) {
                await fs.remove(file);
            }
        }
        logger.error(`Failed to create environment '${envName}': ${error.message}`);
        process.exit(1);
    }
}

module.exports = createEnv;

