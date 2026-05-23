import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ message: "videoId manquant" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return NextResponse.json({ message: "Cours introuvable" }, { status: 404 });
    }

    const order = await prisma.order.create({
      data: { userId, videoId, status: "paid" },
    });

    await prisma.library.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: {},
      create: { userId, videoId },
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (err) {
    console.error("POST /api/purchase error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}