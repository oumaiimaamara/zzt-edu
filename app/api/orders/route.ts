import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ ordersId: string }> }
) {
  try {
    const { ordersId } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id: ordersId },
      include: { video: true, user: true, payment: true },
    });
    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error("GET /api/orders/[ordersId] error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ordersId: string }> }
) {
  try {
    const { ordersId } = await context.params;
    const body = await req.json();
    const updatedOrder = await prisma.order.update({
      where: { id: ordersId },
      data: body,
    });
    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (err) {
    console.error("POST /api/orders/[ordersId] error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}