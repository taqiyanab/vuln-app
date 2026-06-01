import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/reviews - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId query parameter is required" },
        { status: 400 }
      );
    }

    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, username: true, email: true }, // Vulnerability: Exposing email
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Add review
// Vulnerability: XSS stored - no sanitization of comment field
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, rating, comment } = body;

    if (!productId || !userId || !rating || !comment) {
      return NextResponse.json(
        { error: "productId, userId, rating, and comment are required" },
        { status: 400 }
      );
    }

    // Vulnerability: No input sanitization on the comment field
    // HTML/Script tags are stored as-is, enabling Stored XSS
    // No check that the user actually purchased the product
    const review = await db.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(String(rating), 10),
        comment, // Stored exactly as provided - XSS vulnerability!
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Review added successfully", review },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add review", details: String(error) },
      { status: 500 }
    );
  }
}
