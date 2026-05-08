if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const connectionString = env.DATABASE_URL;

// 1. Check for CA in Environment Variable (Production) 
// or the local ca.pem file (Development)
const caPath = path.join(process.cwd(), "ca.pem");
const caExists = fs.existsSync(caPath);
const ca = process.env.DATABASE_CA_CERT || (caExists ? fs.readFileSync(caPath).toString() : undefined);

if (caExists || process.env.DATABASE_CA_CERT) {
  console.log("🔒 [PRISMA] SSL CA certificate loaded.");
}

const pool = new Pool({
  connectionString,
  ssl: ca ? { 
    ca,
    // In production, we want strict verification. In dev, we can be more relaxed.
    rejectUnauthorized: process.env.NODE_ENV === "production"
  } : { 
    rejectUnauthorized: false 
  },
});
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
