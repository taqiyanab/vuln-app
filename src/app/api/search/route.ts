import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/search - Search products
// Vulnerability: SQL injection in search query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q) {
      return NextResponse.json({ results: [], query: "" });
    }

    // Vulnerability: The search query is directly used in database operations
    // Check for SQL injection patterns
    if (
      q.toUpperCase().includes("UNION") ||
      q.toUpperCase().includes("SELECT") ||
      q.includes("--") ||
      q.includes(";")
    ) {
      // Simulate SQL injection vulnerability by returning extra data
      // In a real SQL injection, UNION SELECT would expose other tables
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          password: true, // Vulnerability: Password exposure through SQL injection
          role: true,
        },
      });

      const products = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: q.replace(/['";]/g, "") } },
            { description: { contains: q.replace(/['";]/g, "") } },
          ],
        },
      });

      return NextResponse.json({
        results: products,
        query: q,
        // Vulnerability: SQL injection reveals user data
        _meta: {
          message: "SQL Injection detected! User data exposed:",
          exposedUsers: users,
          injectedQuery: `SELECT * FROM Products WHERE name LIKE '%${q}%' UNION SELECT id, email, username, password, role, '', '', '', '', '', '' FROM Users--`,
        },
      });
    }

    // Normal search
    const results = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } },
        ],
      },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ results, query: q, total: results.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}
