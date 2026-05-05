"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var env_nextjs_1 = require("@t3-oss/env-nextjs");
var zod_1 = require("zod");
exports.env = (0, env_nextjs_1.createEnv)({
    server: {
        NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
        DATABASE_URL: zod_1.z.string().url(),
        // VVIP: Required for match ingestion
        CRICEKT_DATA_API: zod_1.z.string().min(1).optional(),
        // Optional / Feature-based
        AUTH_SECRET: zod_1.z.string().min(1).optional(),
        GEMINI_API_KEY: zod_1.z.string().optional(),
        AUTH_GOOGLE_ID: zod_1.z.string().min(1).optional(),
        AUTH_GOOGLE_SECRET: zod_1.z.string().min(1).optional(),
        RESEND_API_KEY: zod_1.z.string().min(1).optional(),
    },
    client: {
        NEXT_PUBLIC_APP_URL: zod_1.z.string().url().optional(),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL,
        CRICEKT_DATA_API: process.env.CRICEKT_DATA_API,
        AUTH_SECRET: process.env.AUTH_SECRET,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
