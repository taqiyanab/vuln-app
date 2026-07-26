import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/orders - Get orders
// Vulnerability: IDOR - can view other users' orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      // Vulnerability: If no userId is provided, return ALL orders
      const allOrders = await db.order.findMany({
        include: {
          user: {
            select: { id: true, email: true, username: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders: allOrders });
    }

    // Vulnerability: IDOR - no verification that the requesting user
    // is the same as the userId in the query. Any user can view any other user's orders.
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "userId and items array are required" },
        { status: 400 }
      );
    }

    // Calculate total from items
    // Vulnerability: Total is calculated from client-supplied prices, not verified against DB
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const order = await db.order.create({
      data: {
        userId,
        total,
        status: "pending",
        items: {
          create: items.map(
            (item: { productId: string; quantity: number; price: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })
          ),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order", details: String(error) },
      { status: 500 }
    );
  }
}
