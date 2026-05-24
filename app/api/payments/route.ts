import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const { orderId, paymentMethod, status } = await req.json();

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        method: paymentMethod,
        status,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}