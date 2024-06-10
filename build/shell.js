"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDistant = exports.runDistantPrisma = exports.runLocalPrisma = exports.isPrismaCliLocallyInstalled = exports.getPrismaCliPath = exports.runDistant = exports.runLocal = exports.getNodeModules = exports.fileExists = exports.spawnShell = exports.runShell = void 0;
const find_up_1 = __importDefault(require("find-up"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("./errors");
const constants_1 = require("./constants");
const env_1 = require("./env");
let nodeModulesPath;
const runShell = (cmd, options) => {
    if (process.env.verbose == 'true') {
        console.log('  $> ' + cmd);
    }
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, options, (error, stdout, stderr) => {
            if (process.env.verbose == 'true') {
                console.log(stderr || stdout);
            }
            if (error)
                reject(error);
            resolve(stdout);
        });
    });
};
exports.runShell = runShell;
const spawnShell = (cmd) => {
    const [command, ...commandArguments] = cmd.split(' ');
    return new Promise((resolve) => (0, child_process_1.spawn)(command, commandArguments, {
        stdio: 'inherit',
        env: process.env,
        shell: true,
    }).on('exit', (exitCode) => resolve(exitCode)));
};
exports.spawnShell = spawnShell;
const fileExists = (path) => {
    return fs_1.default.promises
        .access(path, fs_1.default.constants.R_OK)
        .then(() => true)
        .catch(() => false);
};
exports.fileExists = fileExists;
const getNodeModules = async (cwd) => {
    if (nodeModulesPath)
        return nodeModulesPath;
    let currentPath = cwd || process.cwd();
    do {
        if (await (0, exports.fileExists)(path_1.default.join(currentPath, 'node_modules'))) {
            nodeModulesPath = path_1.default.join(currentPath, 'node_modules');
        }
        else {
            if (currentPath != path_1.default.join(currentPath, '../')) {
                currentPath = path_1.default.join(currentPath, '../');
            }
            else {
                throw new errors_1.PmtError('no-nodes-modules');
            }
        }
    } while (!nodeModulesPath);
    return nodeModulesPath;
};
exports.getNodeModules = getNodeModules;
const runLocal = async (cmd, env) => {
    const sharedPath = await (0, find_up_1.default)('node_modules/@prisma-multi-tenant/shared/build');
    return (0, exports.runShell)(cmd, {
        cwd: sharedPath || '',
        env: Object.assign(Object.assign({}, process.env), env),
    });
};
exports.runLocal = runLocal;
const runDistant = (cmd, tenant) => {
    console.log(`Executing command: ${cmd}`);
    if (tenant) {
        console.log(`Tenant: ${tenant.name}`);
    }
    return new Promise((resolve, reject) => {
        var _a, _b, _c;
        const baseDbUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
        const isFullUrl = (_a = tenant === null || tenant === void 0 ? void 0 : tenant.url) === null || _a === void 0 ? void 0 : _a.startsWith('postgresql://');
        const fullDbUrl = isFullUrl ? tenant === null || tenant === void 0 ? void 0 : tenant.url : `${baseDbUrl}?schema=${(_b = tenant === null || tenant === void 0 ? void 0 : tenant.url) !== null && _b !== void 0 ? _b : ''}`;
        console.log(baseDbUrl);
        (0, child_process_1.exec)(cmd, {
            cwd: process.cwd(),
            env: Object.assign(Object.assign({}, process.env), { DATABASE_URL: (_c = fullDbUrl !== null && fullDbUrl !== void 0 ? fullDbUrl : process.env.DATABASE_URL) !== null && _c !== void 0 ? _c : 'PMT_TMP_URL' }),
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', error);
                return reject(error);
            }
            if (stderr) {
                console.log('Standard Error Output:', stderr);
            }
            console.log('Standard Output:', stdout);
            resolve(stdout);
        });
    });
};
exports.runDistant = runDistant;
const getPrismaCliPath = async () => {
    const path = await (0, find_up_1.default)('node_modules/prisma/build/index.js');
    if (!path) {
        throw new Error('Cannot find prisma');
    }
    return path;
};
exports.getPrismaCliPath = getPrismaCliPath;
const isPrismaCliLocallyInstalled = async () => {
    return (0, exports.getPrismaCliPath)()
        .then(() => true)
        .catch(() => false);
};
exports.isPrismaCliLocallyInstalled = isPrismaCliLocallyInstalled;
const runLocalPrisma = async (cmd) => {
    const managementEnv = await (0, env_1.getManagementEnv)();
    const nodeModules = await (0, exports.getNodeModules)();
    const PMT_OUTPUT = path_1.default.join(nodeModules, constants_1.clientManagementPath);
    const schemaPath = path_1.default.join(__dirname, 'prisma/schema.prisma');
    return (0, exports.runLocal)(`npx prisma ${cmd} --schema="${schemaPath}"`, Object.assign(Object.assign({}, managementEnv), { PMT_OUTPUT }));
};
exports.runLocalPrisma = runLocalPrisma;
const runDistantPrisma = async (cmd, tenant, withTimeout = true) => {
    const promise = (0, exports.runDistant)(`npx prisma ${cmd}`, tenant);
    if (!withTimeout) {
        return promise;
    }
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            const altCmd = ((tenant === null || tenant === void 0 ? void 0 : tenant.name) ? `prisma-multi-tenant env ${tenant.name} -- ` : '') + 'npx prisma ' + cmd;
            let chalk;
            try {
                chalk = require('chalk');
            }
            catch (_a) { }
            if (chalk) {
                console.log(chalk `\n  {yellow Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}\n`);
            }
            else {
                console.log(`Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}`);
            }
        }, 30 * 1000);
        promise
            .then(() => {
            clearTimeout(timeout);
            console.log('inside resolve promis');
            resolve('');
        })
            .catch((err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
};
exports.runDistantPrisma = runDistantPrisma;
const requireDistant = (name) => {
    var _a;
    const previousEnv = Object.assign({}, process.env);
    const required = require(require.resolve(name, {
        paths: [
            process.cwd() + '/node_modules/',
            process.cwd(),
            ...(((_a = require.main) === null || _a === void 0 ? void 0 : _a.paths) || []),
            __dirname + '/../../../',
        ],
    }));
    process.env = previousEnv;
    return required;
};
exports.requireDistant = requireDistant;
