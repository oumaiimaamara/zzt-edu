import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ ordersId: string }> }
) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { ordersId } = await ctx.params;

    const order = await prisma.order.findUnique({
      where: { id: ordersId },
      include: { video: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    // ✅ DEV : paiement instant
    await prisma.order.update({
      where: { id: ordersId },
      data: { status: "paid" },
    });

    await prisma.library.upsert({
      where: {
        userId_videoId: { userId: user.id, videoId: order.videoId },
      },
      update: {},
      create: { userId: user.id, videoId: order.videoId },
    });

    return NextResponse.json({ message: "Paiement validé (dev)" });
  } catch (e) {
    console.error("PAY ERROR:", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
