import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ ordersId: string }> }
) {
  try {
    const admin = await getUserFromCookies();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    const { ordersId } = await ctx.params;

    const order = await prisma.order.findUnique({
      where: { id: ordersId },
      include: { payment: true },
    });

    if (!order) return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });

    await prisma.order.update({
      where: { id: ordersId },
      data: { status: "paid" },
    });

    await prisma.payment.update({
      where: { orderId: ordersId },
      data: { status: "paid", paidAt: new Date() },
    });

    await prisma.library.upsert({
      where: {
        userId_videoId: { userId: order.userId, videoId: order.videoId },
      },
      update: {},
      create: { userId: order.userId, videoId: order.videoId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("ORDER VALIDATE ERROR:", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
