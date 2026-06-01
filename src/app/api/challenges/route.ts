import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/challenges - List all challenges
export async function GET() {
  try {
    const challenges = await db.challenge.findMany({
      orderBy: [{ category: "asc" }, { difficulty: "asc" }],
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch challenges", details: String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/challenges - Mark challenge as solved
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    // Can find challenge by id or name
    const where = id ? { id } : name ? { name } : null;

    if (!where) {
      return NextResponse.json(
        { error: "Challenge id or name is required" },
        { status: 400 }
      );
    }

    const challenge = await db.challenge.update({
      where,
      data: { solved: true },
    });

    return NextResponse.json({
      message: "Challenge marked as solved!",
      challenge,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update challenge", details: String(error) },
      { status: 500 }
    );
  }
}
