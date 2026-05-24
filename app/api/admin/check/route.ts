import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/authFromRequest";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ authenticated: false }, { status: 403 });
    }

    return NextResponse.json({ authenticated: true, user }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/check error:", err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}