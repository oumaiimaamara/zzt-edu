import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/currentUser";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  const { videoId } = await req.json();
  if (!videoId) return NextResponse.json({ error: "MISSING_VIDEO_ID" }, { status: 400 });

  await prisma.order.create({ data: { userId, videoId, status: "paid" } });

  await prisma.library.upsert({
    where: { userId_videoId: { userId, videoId } },
    update: {},
    create: { userId, videoId },
  });

  return NextResponse.json({ ok: true });
}
