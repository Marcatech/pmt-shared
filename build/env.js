"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSchemaFile = exports.readSchemaFile = exports.getSchemaPath = exports.schemaPaths = exports.writeEnvFile = exports.readEnvFile = exports.getEnvPath = exports.envPaths = exports.setManagementEnv = exports.getManagementEnv = exports.translateDatasourceUrl = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("./errors");
const shell_1 = require("./shell");
const translateDatasourceUrl = (url, cwd) => {
    if (url.startsWith('"') && url.endsWith('"')) {
        url = url.slice(1, -1);
    }
    if (url.startsWith('file:') && !url.startsWith('file:/')) {
        return 'file:' + path_1.default.join(cwd || process.cwd(), url.replace('file:', '')).replace(/\\/g, '/');
    }
    return url;
};
exports.translateDatasourceUrl = translateDatasourceUrl;
const getManagementEnv = async () => {
    if (!process.env.MANAGEMENT_URL) {
        throw new errors_1.PmtError('missing-env', { name: 'MANAGEMENT_URL' });
    }
    const managementUrl = (0, exports.translateDatasourceUrl)(process.env.MANAGEMENT_URL);
    return {
        PMT_MANAGEMENT_URL: managementUrl,
        PMT_OUTPUT: 'PMT_TMP',
    };
};
exports.getManagementEnv = getManagementEnv;
const setManagementEnv = async () => {
    const managementEnv = await (0, exports.getManagementEnv)();
    Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value));
};
exports.setManagementEnv = setManagementEnv;
exports.envPaths = [process.env.ENV_PATH];
const getEnvPath = async (schemaPath) => {
    if (process.env.ENV_PATH) {
        const envPathFromEnvVar = process.env.ENV_PATH;
        if (await (0, shell_1.fileExists)(envPathFromEnvVar)) {
            return envPathFromEnvVar;
        }
    }
    if (schemaPath) {
        const envPath = path_1.default.join(path_1.default.dirname(schemaPath), '.env');
        if (await (0, shell_1.fileExists)(envPath)) {
            return envPath;
        }
    }
    for (const envPath of exports.envPaths) {
        if (envPath && (await (0, shell_1.fileExists)(envPath))) {
            return envPath;
        }
    }
    throw new Error("Couldn't find the prisma/.env file");
};
exports.getEnvPath = getEnvPath;
const readEnvFile = async (schemaPath) => {
    const path = await (0, exports.getEnvPath)(schemaPath);
    return fs_1.default.promises.readFile(path, 'utf-8');
};
exports.readEnvFile = readEnvFile;
const writeEnvFile = async (content, schemaPath) => {
    let path;
    try {
        path = await (0, exports.getEnvPath)(schemaPath);
    }
    catch (_a) {
        path = 'prisma/.env';
    }
    return fs_1.default.promises.writeFile(path, content);
};
exports.writeEnvFile = writeEnvFile;
exports.schemaPaths = [process.env.SCHEMA_PATH];
const getSchemaPath = async () => {
    console.log(exports.schemaPaths);
    for (const schemaPath of exports.schemaPaths) {
        if (schemaPath && (await (0, shell_1.fileExists)(schemaPath))) {
            return schemaPath;
        }
    }
    throw new Error("Couldn't find the schema file");
};
exports.getSchemaPath = getSchemaPath;
const readSchemaFile = async (schemaPath) => {
    const path = schemaPath || (await (0, exports.getSchemaPath)());
    return fs_1.default.promises.readFile(path, 'utf-8');
};
exports.readSchemaFile = readSchemaFile;
const writeSchemaFile = async (content, schemaPath) => {
    const path = schemaPath || (await (0, exports.getSchemaPath)());
    return fs_1.default.promises.writeFile(path, content, 'utf-8');
};
exports.writeSchemaFile = writeSchemaFile;
