import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    // Check database connectivity
    const userCount = await db.user.count();
    const productCount = await db.product.count();

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      stats: {
        users: userCount,
        products: productCount,
      },
      // Vulnerability: Exposing version and tech stack info
      version: "1.0.0",
      stack: {
        framework: "Next.js 16",
        database: "SQLite",
        orm: "Prisma",
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 }
    );
  }
}
