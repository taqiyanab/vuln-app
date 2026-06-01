import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/[id] - Get single product by ID
// Vulnerability: IDOR - no ownership check, any product can be accessed by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
        orderItems: true, // Vulnerability: Exposes order items (internal data)
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product", details: String(error) },
      { status: 500 }
    );
  }
}
