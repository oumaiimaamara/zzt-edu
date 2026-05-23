import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId") || "";

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!videoId) {
      return NextResponse.json({ eligible: false, message: "videoId manquant" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ eligible: false }, { status: 200 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded?.userId;

    if (!userId) {
      return NextResponse.json({ eligible: false }, { status: 200 });
    }

    // ✅ Acheteur réel = existe dans Library (ajouté après paiement)
    const exists = await prisma.library.findFirst({
      where: { userId, videoId },
      select: { id: true },
    });

    return NextResponse.json({ eligible: Boolean(exists) }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ eligible: false }, { status: 200 });
  }
}
