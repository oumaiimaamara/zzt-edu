import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { orderId, paymentMethod, status, amount } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: "orderId manquant" }, { status: 400 });
    }

    // Vérifier que la commande appartient à l'utilisateur
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }
    if (order.userId !== userId) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: amount ?? order.video?.price ?? 0,
        method: paymentMethod ?? "online",
        status: status ?? "paid",
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}