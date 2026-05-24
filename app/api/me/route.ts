import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ user: null }, { status: 200 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user: user ?? null }, { status: 200 });
  } catch (err) {
    console.error("GET /api/me error:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}