import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Non connecté" }, { status: 401 });
    }

    const items = await prisma.library.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
      include: {
        video: {
          include: { category: true, professional: true },
        },
      },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/library error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}