import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products - List all products with optional category filter and search
// Vulnerability: No rate limiting, no pagination (mass data exposure)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Vulnerability: No pagination - returns ALL products at once
    // Vulnerability: No rate limiting on this endpoint
    const products = await db.product.findMany({
      where,
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    // Vulnerability: Detailed error messages exposing internal information
    return NextResponse.json(
      { error: "Failed to fetch products", details: String(error) },
      { status: 500 }
    );
  }
}
