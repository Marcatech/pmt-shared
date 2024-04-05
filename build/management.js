"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./env");
const constants_1 = require("./constants");
const shell_1 = require("./shell");
const errors_1 = require("./errors");
class Management {
    constructor(options) {
        this.options = options;
    }
    async getClient() {
        var _a, _b;
        if (this.client)
            return this.client;
        await (0, env_1.setManagementEnv)();
        let PrismaClient;
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.PrismaClient) {
            PrismaClient = (_b = this.options) === null || _b === void 0 ? void 0 : _b.PrismaClient;
        }
        else {
            try {
                PrismaClient = (0, shell_1.requireDistant)(constants_1.clientManagementPath).PrismaClient;
            }
            catch (_c) {
                console.error(`\nError: Cannot find module '.prisma-multi-tenant/management'.\n\nTry running "prisma-multi-tenant generate"\n`);
                process.exit(1);
            }
        }
        this.client = new PrismaClient();
        return this.client;
    }
    async create(tenant) {
        let client;
        let result;
        try {
            client = await this.getClient();
            result = await client.tenant.create({
                data: tenant,
            });
        }
        catch (err) {
            if (err.code == 'P2002')
                throw new errors_1.PmtError('tenant-already-exists', tenant.name);
            throw err;
        }
        finally {
            if (client) {
                console.log("Disconnecting Prisma client");
                await client.$disconnect();
                if (result)
                    return result;
            }
        }
        return result;
    }
    async read(name) {
        const client = await this.getClient();
        const tenant = await client.tenant.findUnique({ where: { name } });
        if (!tenant) {
            throw new errors_1.PmtError('tenant-does-not-exist', name);
        }
        return this.sanitizeTenant(tenant);
    }
    async exists(name) {
        const client = await this.getClient();
        const tenant = await client.tenant.findUnique({ where: { name } });
        return !!tenant;
    }
    async list() {
        const client = await this.getClient();
        const tenants = await client.tenant.findMany();
        return tenants.map(this.sanitizeTenant);
    }
    async update(name, update) {
        const client = await this.getClient();
        try {
            return await client.tenant.update({
                where: { name },
                data: update,
            });
        }
        catch (err) {
            if (err.message.includes('RecordNotFound'))
                throw new errors_1.PmtError('tenant-does-not-exist', name);
            throw err;
        }
    }
    async delete(name) {
        const client = await this.getClient();
        try {
            return await client.tenant.delete({ where: { name } });
        }
        catch (err) {
            if (err.message.includes('RecordNotFound'))
                throw new errors_1.PmtError('tenant-does-not-exist', name);
            throw err;
        }
    }
    disconnect() {
        if (!this.client)
            return Promise.resolve();
        return this.client.$disconnect();
    }
    sanitizeTenant(tenant) {
        return {
            name: tenant.name,
            url: tenant.url,
        };
    }
}
exports.default = Management;
