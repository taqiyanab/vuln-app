import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin - Admin panel data
// Vulnerability: No proper auth check, just checks a header
export async function GET(request: NextRequest) {
  try {
    // Vulnerability: Only checks for the presence of an "x-admin" header
    // This is not real authentication - anyone can set this header
    const adminHeader = request.headers.get("x-admin");

    if (!adminHeader) {
      return NextResponse.json(
        { error: "Access denied. Admin access required." },
        { status: 403 }
      );
    }

    // Vulnerability: Exposing all user data including password hashes
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        password: true, // Vulnerability: Password exposure (Sensitive Data Exposure)
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const orders = await db.order.findMany({
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
        items: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    const reviews = await db.review.findMany({
      include: {
        user: { select: { username: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      message: "Welcome to the admin panel!",
      stats: {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      },
      users, // Vulnerability: All user data including passwords exposed
      orders,
      products,
      reviews,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Admin access failed", details: String(error) },
      { status: 500 }
    );
  }
}
