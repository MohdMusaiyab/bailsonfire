"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var pg_1 = require("pg");
var adapter_pg_1 = require("@prisma/adapter-pg");
var client_1 = require("@prisma/client");
var env_1 = require("./env");
var connectionString = env_1.env.DATABASE_URL;
var pool = new pg_1.Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Neon pooler uses a self-signed cert
});
var adapter = new adapter_pg_1.PrismaPg(pool);
var globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        adapter: adapter,
        log: env_1.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
if (env_1.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
