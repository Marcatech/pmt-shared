"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.runShell = (cmd, options) => {
    if (process.env.verbose == 'true') {
        console.log('  $> ' + cmd);
    }
    return new Promise((resolve, reject) => {
        child_process_1.exec(cmd, options, (error, stdout, stderr) => {
            if (process.env.verbose == 'true') {
                console.log(stderr || stdout);
            }
            if (error)
                reject(error);
            resolve(stdout);
        });
    });
};
exports.spawnShell = (cmd) => {
    const [command, ...commandArguments] = cmd.split(' ');
    return new Promise((resolve) => child_process_1.spawn(command, commandArguments, {
        stdio: 'inherit',
        env: process.env,
        shell: true,
    }).on('exit', (exitCode) => resolve(exitCode)));
};
exports.fileExists = (path) => {
    return fs_1.default.promises
        .access(path, fs_1.default.constants.R_OK)
        .then(() => true)
        .catch(() => false);
};
exports.getNodeModules = (cwd) => __awaiter(void 0, void 0, void 0, function* () {
    if (nodeModulesPath)
        return nodeModulesPath;
    let currentPath = cwd || process.cwd();
    do {
        if (yield exports.fileExists(path_1.default.join(currentPath, 'node_modules'))) {
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
});
exports.runLocal = (cmd, env) => __awaiter(void 0, void 0, void 0, function* () {
    const sharedPath = yield find_up_1.default('node_modules/@prisma-multi-tenant/shared/build');
    return exports.runShell(cmd, {
        cwd: sharedPath || '',
        env: Object.assign(Object.assign({}, process.env), env),
    });
});
exports.runDistant = (cmd, tenant) => {
    return exports.runShell(cmd, {
        cwd: process.cwd(),
        env: Object.assign(Object.assign({}, process.env), { DATABASE_URL: (tenant === null || tenant === void 0 ? void 0 : tenant.url) || process.env.DATABASE_URL || 'PMT_TMP_URL' }),
    });
};
exports.getPrismaCliPath = () => __awaiter(void 0, void 0, void 0, function* () {
    const path = yield find_up_1.default('node_modules/prisma/build/index.js');
    if (!path) {
        throw new Error('Cannot find prisma');
    }
    return path;
});
exports.isPrismaCliLocallyInstalled = () => __awaiter(void 0, void 0, void 0, function* () {
    return exports.getPrismaCliPath()
        .then(() => true)
        .catch(() => false);
});
exports.runLocalPrisma = (cmd) => __awaiter(void 0, void 0, void 0, function* () {
    const prismaCliPath = yield exports.getPrismaCliPath();
    const managementEnv = yield env_1.getManagementEnv();
    const nodeModules = yield exports.getNodeModules();
    const PMT_OUTPUT = path_1.default.join(nodeModules, constants_1.clientManagementPath);
    const schemaPath = path_1.default.join(__dirname, 'prisma/schema.prisma');
    return exports.runLocal(`node "${prismaCliPath}" ${cmd} --schema="${schemaPath}"`, Object.assign(Object.assign({}, managementEnv), { PMT_OUTPUT }));
});
exports.runDistantPrisma = (cmd, tenant, withTimeout = true) => __awaiter(void 0, void 0, void 0, function* () {
    const prismaCliPath = yield exports.getPrismaCliPath();
    const promise = exports.runDistant(`node "${prismaCliPath}" ${cmd}`, tenant);
    if (!withTimeout) {
        return promise;
    }
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            const altCmd = ((tenant === null || tenant === void 0 ? void 0 : tenant.name) ? `prisma-multi-tenant env ${tenant.name} -- ` : '') +
                'npx prisma ' +
                cmd;
            let chalk;
            try {
                chalk = require('chalk');
            }
            catch (_a) { }
            if (chalk) {
                console.log(chalk `\n  {yellow Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}\n`);
            }
            else {
                console.log(`Note: Prisma seems to be unresponnsive. Try running \`${altCmd.trim()}\`}`);
            }
        }, 30 * 1000);
        promise
            .then(() => {
            clearTimeout(timeout);
            resolve("");
        })
            .catch((err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
});
exports.requireDistant = (name) => {
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
