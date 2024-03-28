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
exports.writeSchemaFile = exports.readSchemaFile = exports.getSchemaPath = exports.schemaPaths = exports.writeEnvFile = exports.readEnvFile = exports.getEnvPath = exports.envPaths = exports.setManagementEnv = exports.getManagementEnv = exports.translateDatasourceUrl = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("./errors");
const shell_1 = require("./shell");
exports.translateDatasourceUrl = (url, cwd) => {
    if (url.startsWith('"') && url.endsWith('"')) {
        url = url.slice(1, -1);
    }
    if (url.startsWith('file:') && !url.startsWith('file:/')) {
        return 'file:' + path_1.default.join(cwd || process.cwd(), url.replace('file:', '')).replace(/\\/g, '/');
    }
    return url;
};
exports.getManagementEnv = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.MANAGEMENT_URL) {
        throw new errors_1.PmtError('missing-env', { name: 'MANAGEMENT_URL' });
    }
    const managementUrl = exports.translateDatasourceUrl(process.env.MANAGEMENT_URL);
    return {
        PMT_MANAGEMENT_URL: managementUrl,
        PMT_OUTPUT: 'PMT_TMP',
    };
});
exports.setManagementEnv = () => __awaiter(void 0, void 0, void 0, function* () {
    const managementEnv = yield exports.getManagementEnv();
    Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value));
});
exports.envPaths = [process.env.ENV_PATH];
exports.getEnvPath = (schemaPath) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.ENV_PATH) {
        const envPathFromEnvVar = process.env.ENV_PATH;
        if (yield shell_1.fileExists(envPathFromEnvVar)) {
            return envPathFromEnvVar;
        }
    }
    if (schemaPath) {
        const envPath = path_1.default.join(path_1.default.dirname(schemaPath), '.env');
        if (yield shell_1.fileExists(envPath)) {
            return envPath;
        }
    }
    for (const envPath of exports.envPaths) {
        if (envPath && (yield shell_1.fileExists(envPath))) {
            return envPath;
        }
    }
    throw new Error("Couldn't find the prisma/.env file");
});
exports.readEnvFile = (schemaPath) => __awaiter(void 0, void 0, void 0, function* () {
    const path = yield exports.getEnvPath(schemaPath);
    return fs_1.default.promises.readFile(path, 'utf-8');
});
exports.writeEnvFile = (content, schemaPath) => __awaiter(void 0, void 0, void 0, function* () {
    let path;
    try {
        path = yield exports.getEnvPath(schemaPath);
    }
    catch (_a) {
        path = 'prisma/.env';
    }
    return fs_1.default.promises.writeFile(path, content);
});
exports.schemaPaths = [process.env.SCHEMA_PATH];
exports.getSchemaPath = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(exports.schemaPaths);
    for (const schemaPath of exports.schemaPaths) {
        if (schemaPath && (yield shell_1.fileExists(schemaPath))) {
            return schemaPath;
        }
    }
    throw new Error("Couldn't find the schema file");
});
exports.readSchemaFile = (schemaPath) => __awaiter(void 0, void 0, void 0, function* () {
    const path = schemaPath || (yield exports.getSchemaPath());
    return fs_1.default.promises.readFile(path, 'utf-8');
});
exports.writeSchemaFile = (content, schemaPath) => __awaiter(void 0, void 0, void 0, function* () {
    const path = schemaPath || (yield exports.getSchemaPath());
    return fs_1.default.promises.writeFile(path, content, 'utf-8');
});
