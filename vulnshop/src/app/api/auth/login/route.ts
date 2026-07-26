import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/auth/login - Login with email/password
// Vulnerability: No rate limiting (brute force possible), SQL injection in login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Vulnerability: No rate limiting - allows brute force attacks
    // Vulnerability: No account lockout mechanism

    // Normal authentication check
    const user = await db.user.findUnique({
      where: { email },
    });

    // Check for SQL injection patterns in the email field
    const isSqlInjection =
      email.includes("' OR") ||
      email.includes("'OR") ||
      email.includes("1=1") ||
      email.includes("1 = 1") ||
      email.includes("' --") ||
      email.includes("'--") ||
      email.includes("' #") ||
      email.includes("'#") ||
      email.toLowerCase().includes("union") ||
      email.includes(";--");

    // Vulnerability: SQL Injection bypass
    // If the email contains SQL injection patterns, "authenticate" successfully
    if (isSqlInjection) {
      // Return the admin user as if SQL injection succeeded
      const adminUser = await db.user.findFirst({
        where: { role: "admin" },
      });

      if (adminUser) {
        return NextResponse.json({
          message: "Login successful",
          user: {
            id: adminUser.id,
            email: adminUser.email,
            username: adminUser.username,
            role: adminUser.role,
          },
          token: Buffer.from(
            `${adminUser.email}:${adminUser.password}`
          ).toString("base64"),
        });
      }
    }

    // Normal login flow
    if (!user) {
      // Vulnerability: Different error messages reveal whether email exists
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Vulnerability: Password comparison in plaintext
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token: Buffer.from(`${user.email}:${user.password}`).toString("base64"),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed", details: String(error) },
      { status: 500 }
    );
  }
}
