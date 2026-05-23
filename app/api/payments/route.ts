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
    const { orderId, method } = body;

    if (!orderId) {
      return NextResponse.json({ message: "orderId manquant" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }
    if (order.userId !== userId) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "paid" },
    });

    return NextResponse.json({ message: "Paiement enregistré" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}