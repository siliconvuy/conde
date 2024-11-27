const fs = require('fs-extra');
const path = require('path');
const CONFIG = require('../utils/config');
const logger = require('../utils/logger');
const packageManager = require('../utils/packageManager');

async function installPackage(packageName, options = {}) {
    try {
        if (!process.env.CONDE_ENV) {
            logger.error("No active environment. Use 'conde activate <env>' to activate an environment.");
            process.exit(1);
        }

        const envPath = path.join(CONFIG.envsDir, process.env.CONDE_ENV);

        if (options.fromPackageJson) {
            const packageJson = await fs.readJson(packageName);
            
            // Verificar conflictos
            const conflicts = await packageManager.checkDependencyConflicts(envPath, packageJson);
            
            if (conflicts.length > 0) {
                logger.error('Dependency conflicts detected:');
                conflicts.forEach(conflict => {
                    logger.error(`  ${conflict.package}: requires ${conflict.required}, but ${conflict.installed} is installed`);
                });
                logger.info('Consider creating a new environment to resolve conflicts');
                process.exit(1);
            }

            // Instalar dependencias
            for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
                const requiredVersion = version.replace(/^\^|~/, '');
                const pkgPath = await packageManager.installPackage(name, requiredVersion, envPath);
                await packageManager.linkPackageToEnv(pkgPath, envPath);
            }
        } else {
            // Instalar un solo paquete
            const [name, version] = packageName.split('@');
            const pkgPath = await packageManager.installPackage(name, version || 'latest', envPath);
            await packageManager.linkPackageToEnv(pkgPath, envPath);
        }

        logger.success('Packages installed successfully');
    } catch (error) {
        logger.error(`Failed to install packages: ${error.message}`);
        process.exit(1);
    }
}

module.exports = installPackage;

