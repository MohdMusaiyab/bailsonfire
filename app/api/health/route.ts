import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Actively query an application table to register database disk & schema I/O with Aiven
    const [matchCount] = await Promise.all([
      prisma.match.count(),
      prisma.$queryRaw`SELECT 1`,
    ]);

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        totalMatches: matchCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[HEALTH_CHECK_ERROR] Database connection failed:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        message: "Database ping failed",
      },
      { status: 500 },
    );
  }
}
