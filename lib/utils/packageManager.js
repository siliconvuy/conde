const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const { execSync } = require('child_process');
const logger = require('./logger');
const CONFIG = require('./config');

class PackageManager {
    constructor() {
        this.packagesDir = CONFIG.packagesDir;
        this.pkginfoDir = CONFIG.pkginfoDir;
        this.nodeVersionWarnings = new Set(); // Para evitar advertencias duplicadas
    }

    // Obtener la ruta del paquete considerando scopes
    getPackagePath(name, version) {
        // Si el nombre tiene scope (@org/pkg), mantener la estructura de directorios
        if (name.startsWith('@')) {
            const [scope, pkg] = name.split('/');
            return path.join(this.packagesDir, scope, `${pkg}@${version}`);
        }
        return path.join(this.packagesDir, `${name}@${version}`);
    }

    // Verificar si una versión del paquete ya está instalada
    async isPackageInstalled(name, version) {
        const pkgPath = this.getPackagePath(name, version);
        return fs.existsSync(pkgPath);
    }

    // Verificar compatibilidad de dependencias
    async checkDependencyConflicts(envPath, packageJson) {
        const conflicts = [];
        const envPackages = await this.getEnvironmentPackages(envPath);

        for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
            const requiredVersion = version.replace(/^\^|~/, '');
            
            if (envPackages[name]) {
                const installedVersion = envPackages[name];
                if (!semver.satisfies(installedVersion, version)) {
                    conflicts.push({
                        package: name,
                        required: version,
                        installed: installedVersion
                    });
                }
            }
        }

        return conflicts;
    }

    // Obtener paquetes instalados en un entorno
    async getEnvironmentPackages(envPath) {
        const nodeModulesPath = path.join(envPath, 'lib', 'node_modules');
        const packages = {};

        if (!fs.existsSync(nodeModulesPath)) {
            return packages;
        }

        const dirs = await fs.readdir(nodeModulesPath);
        for (const dir of dirs) {
            if (dir.startsWith('.')) continue;
            
            const pkgJsonPath = path.join(nodeModulesPath, dir, 'package.json');
            if (fs.existsSync(pkgJsonPath)) {
                const pkgJson = await fs.readJson(pkgJsonPath);
                packages[dir] = pkgJson.version;
            }
        }

        return packages;
    }

    // Verificar compatibilidad de Node.js
    async checkNodeCompatibility(envPath, packageName, packageVersion) {
        try {
            const tempDir = path.join(this.packagesDir, '.temp');
            await fs.ensureDir(tempDir);

            // Obtener package.json del paquete
            execSync(`npm view ${packageName}@${packageVersion} engines --json > ${path.join(tempDir, 'engines.json')}`, { stdio: 'ignore' });
            const enginesData = await fs.readJson(path.join(tempDir, 'engines.json'));
            await fs.remove(tempDir);

            const nodeVersion = await this.getEnvNodeVersion(envPath);
            const requiredNode = enginesData.node;

            if (requiredNode && !semver.satisfies(nodeVersion, requiredNode)) {
                const warningKey = `${packageName}@${packageVersion}-${nodeVersion}`;
                if (!this.nodeVersionWarnings.has(warningKey)) {
                    this.nodeVersionWarnings.add(warningKey);
                    logger.warning(`Package ${packageName}@${packageVersion} prefers Node.js ${requiredNode}`);
                    logger.warning(`Current environment uses Node.js ${nodeVersion}`);
                    logger.info('To update Node.js version:');
                    logger.info('1. Create a new environment: conde create new-env --node <version>');
                    logger.info('2. Or update current environment: conde update --node <version> (may break compatibility)');
                }
                return false;
            }
            return true;
        } catch (error) {
            // Si no podemos verificar la compatibilidad, continuamos sin advertencia
            return true;
        }
    }

    async getEnvNodeVersion(envPath) {
        const nodeVersionFile = path.join(envPath, 'node_version');
        if (await fs.exists(nodeVersionFile)) {
            return (await fs.readFile(nodeVersionFile, 'utf-8')).trim();
        }
        return process.version.slice(1); // Eliminar el 'v' inicial
    }

    // Instalar paquete en el almacén central
    async installPackage(name, version, envPath) {
        const pkgPath = this.getPackagePath(name, version);
        
        try {
            // Verificar compatibilidad de Node.js antes de instalar
            await this.checkNodeCompatibility(envPath, name, version);

            if (await this.isPackageInstalled(name, version)) {
                logger.info(`Package ${name}@${version} already installed, reusing...`);
                return pkgPath;
            }

            // Crear directorio temporal para la instalación
            const tempDir = path.join(this.packagesDir, '.temp');
            await fs.ensureDir(tempDir);

            // Instalar el paquete en el directorio temporal
            logger.info(`Installing ${name}@${version} in central store...`);
            execSync(`npm install ${name}@${version} --prefix "${tempDir}" --no-package-lock`, { 
                stdio: 'inherit',
                env: {
                    ...process.env,
                    npm_config_loglevel: 'error'
                }
            });

            // Mover el paquete instalado a su ubicación final
            const tempPkgPath = path.join(tempDir, 'node_modules', ...name.split('/'));
            await fs.ensureDir(path.dirname(pkgPath));
            await fs.move(tempPkgPath, pkgPath, { overwrite: true });

            // Limpiar directorio temporal
            await fs.remove(tempDir);

            return pkgPath;
        } catch (error) {
            logger.error(`Failed to install ${name}@${version}: ${error.message}`);
            throw error;
        }
    }

    // Enlazar paquete a un entorno
    async linkPackageToEnv(pkgPath, envPath) {
        const nodeModulesPath = path.join(envPath, 'lib', 'node_modules');
        const binPath = path.join(nodeModulesPath, '.bin');
        await fs.ensureDir(nodeModulesPath);
        await fs.ensureDir(binPath);

        // Extraer el nombre completo del paquete (incluyendo scope si existe)
        const pkgParts = pkgPath.split(path.sep);
        const scopeIndex = pkgParts.findIndex(part => part.startsWith('@'));
        const pkgName = scopeIndex !== -1 
            ? `${pkgParts[scopeIndex]}/${pkgParts[scopeIndex + 1].split('@')[0]}`
            : path.basename(pkgPath).split('@')[0];

        // Crear la estructura de directorios para paquetes con scope
        const targetPath = path.join(nodeModulesPath, ...pkgName.split('/'));
        await fs.ensureDir(path.dirname(targetPath));

        try {
            // Eliminar enlaces existentes si existen
            if (fs.existsSync(targetPath)) {
                await fs.remove(targetPath);
            }

            // Crear enlace simbólico para el paquete
            await fs.ensureSymlink(pkgPath, targetPath, 'junction');
            logger.info(`Linked ${pkgName} to environment`);

            // Crear enlaces simbólicos para los binarios
            const pkgJson = await fs.readJson(path.join(pkgPath, 'package.json'));
            if (pkgJson.bin) {
                // Asegurarse de que el directorio bin existe y tiene permisos correctos
                await fs.ensureDir(binPath);
                await fs.chmod(binPath, '755');

                if (typeof pkgJson.bin === 'string') {
                    const binSource = path.join(pkgPath, pkgJson.bin);
                    const binTarget = path.join(binPath, pkgName.split('/').pop());
                    await fs.chmod(binSource, '755');  // Asegurar que el source es ejecutable
                    await fs.ensureSymlink(binSource, binTarget, 'file');
                    await fs.chmod(binTarget, '755');
                } else {
                    for (const [binName, binPath] of Object.entries(pkgJson.bin)) {
                        const binSource = path.join(pkgPath, binPath);
                        const binTarget = path.join(binPath, binName);
                        await fs.chmod(binSource, '755');  // Asegurar que el source es ejecutable
                        await fs.ensureSymlink(binSource, binTarget, 'file');
                        await fs.chmod(binTarget, '755');
                    }
                }
                logger.info(`Created binary links for ${pkgName}`);
            }
        } catch (error) {
            logger.error(`Failed to link ${pkgName}: ${error.message}`);
            throw error;
        }
    }

    // Limpiar paquetes no utilizados
    async cleanUnusedPackages() {
        const envs = await fs.readdir(CONFIG.envsDir);
        const usedPackages = new Set();

        // Recolectar todos los paquetes en uso
        for (const env of envs) {
            const envPath = path.join(CONFIG.envsDir, env);
            const packages = await this.getEnvironmentPackages(envPath);
            Object.entries(packages).forEach(([name, version]) => {
                usedPackages.add(`${name}@${version}`);
            });
        }

        // Eliminar paquetes no utilizados
        const storedPackages = await fs.readdir(this.packagesDir);
        for (const pkg of storedPackages) {
            if (!usedPackages.has(pkg) && !pkg.startsWith('.')) {
                const pkgPath = path.join(this.packagesDir, pkg);
                await fs.remove(pkgPath);
                logger.info(`Removed unused package: ${pkg}`);
            }
        }
    }
}

module.exports = new PackageManager(); 