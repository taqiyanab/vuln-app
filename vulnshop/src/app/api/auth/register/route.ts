import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/register - Register new user
// Vulnerability: Mass assignment - role can be set via request body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, role, address } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Vulnerability: Mass assignment - the role field can be set by the client
    // A normal registration should always set role to "customer"
    // But here we allow the client to specify any role including "admin"
    const user = await db.user.create({
      data: {
        email,
        username,
        password, // Vulnerability: Password stored in plaintext
        role: role || "customer", // Vulnerability: Mass assignment
        address: address || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        address: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
        // Vulnerability: Returning password in response (Sensitive Data Exposure)
        token: Buffer.from(`${email}:${password}`).toString("base64"),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed", details: String(error) },
      { status: 500 }
    );
  }
}
