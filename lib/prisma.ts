if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Parse the URL to remove sslmode=require. 
// If we pass sslmode=require to pg, it completely overwrites our custom ssl object!
const parsedUrl = new URL(env.DATABASE_URL);
parsedUrl.searchParams.delete("sslmode");
const connectionString = parsedUrl.toString();

// 1. Check for CA in Environment Variable (Production) 
// or the local ca.pem file (Development)
const caPath = path.join(process.cwd(), "ca.pem");
const caExists = fs.existsSync(caPath);
const rawCa = process.env.DATABASE_CA_CERT;
// Vercel sometimes escapes newlines as literal '\n' strings. We MUST replace them for valid PEM parsing.
const parsedEnvCa = rawCa ? rawCa.replace(/\\n/g, "\n") : undefined;
const ca = parsedEnvCa || (caExists ? fs.readFileSync(caPath).toString() : undefined);

if (caExists || process.env.DATABASE_CA_CERT) {
  console.log("🔒 [PRISMA] SSL CA certificate loaded.");
}

const pool = new Pool({
  connectionString,
  ssl: ca ? { 
    ca,
    rejectUnauthorized: true // Secure! Strict validation using Aiven CA
  } : { 
    rejectUnauthorized: false // Fallback if no CA is provided
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
