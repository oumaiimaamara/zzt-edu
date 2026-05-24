import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function POST(
  req: Request,
  context: { params: Promise<{ ordersId: string }> }
) {
  try {
    const { ordersId } = await context.params;

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const order = await prisma.order.update({
      where: { id: ordersId },
      data: { status: "paid" },
    });

    await prisma.library.upsert({
      where: { userId_videoId: { userId: order.userId, videoId: order.videoId } },
      update: {},
      create: { userId: order.userId, videoId: order.videoId },
    });

    return NextResponse.json({ message: "Commande validée", order }, { status: 200 });
  } catch (err) {
    console.error("POST /api/orders/[ordersId]/validate error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}