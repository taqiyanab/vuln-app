import { NextRequest, NextResponse } from "next/server";

// In-memory cart storage (simplified for demo)
// In production, this would be in a database
const carts: Record<
  string,
  Array<{ productId: string; quantity: number; name: string; price: number }>
> = {};

// GET /api/cart - Get cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const cartItems = carts[userId] || [];
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json({ items: cartItems, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, name, price, quantity } = body;

    if (!userId || !productId || !name || !price || !quantity) {
      return NextResponse.json(
        { error: "userId, productId, name, price, and quantity are required" },
        { status: 400 }
      );
    }

    // Vulnerability: No validation that the price matches the actual product price
    // A user could add items with a manipulated price
    if (!carts[userId]) {
      carts[userId] = [];
    }

    const existingItem = carts[userId].find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += parseInt(String(quantity), 10);
    } else {
      carts[userId].push({
        productId,
        quantity: parseInt(String(quantity), 10),
        name,
        price: parseFloat(String(price)), // Vulnerability: Client-supplied price
      });
    }

    const total = carts[userId].reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json({
      message: "Item added to cart",
      items: carts[userId],
      total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add to cart", details: String(error) },
      { status: 500 }
    );
  }
}
