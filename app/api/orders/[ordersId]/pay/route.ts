import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ ordersId: string }> }
) {
  try {
    const { ordersId } = await ctx.params;

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: ordersId },
      include: { video: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable." }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ message: "Accès refusé." }, { status: 403 });
    }

    await prisma.order.update({
      where: { id: ordersId },
      data: { status: "paid" },
    });

    await prisma.library.upsert({
      where: { userId_videoId: { userId, videoId: order.videoId } },
      update: {},
      create: { userId, videoId: order.videoId },
    });

    return NextResponse.json({ message: "Paiement OK" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/orders/[ordersId]/pay error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}