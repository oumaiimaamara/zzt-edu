import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ message: "videoId manquant" }, { status: 400 });
    }

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ hasAccess: false }, { status: 200 });
    }

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