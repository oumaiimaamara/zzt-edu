import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ message: "videoId manquant" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

    const decoded = await verifyToken(token);

    // ⚡ Correction : utiliser decoded.id à la place de userId
    const userId = decoded?.id;
    if (!userId) return NextResponse.json({ hasAccess: false }, { status: 200 });

    // ✅ user a accès si la vidéo est dans Library
    const lib = await prisma.library.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { id: true },
    });

    return NextResponse.json({ hasAccess: !!lib }, { status: 200 });
  } catch (err) {
    console.error("GET /api/access error:", err);
    return NextResponse.json({ hasAccess: false }, { status: 200 });
  }
}
