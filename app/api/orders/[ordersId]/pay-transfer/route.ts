import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ ordersId: string }> }
) {
  try {
    const user = await getUserFromCookies();
    if (!user) return NextResponse.json({ message: "Non authentifié" }, { status: 401 });

    const { ordersId } = await ctx.params;

    const order = await prisma.order.findUnique({
      where: { id: ordersId },
      include: { video: true },
    });

    if (!order) return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    if (order.userId !== user.userId) return NextResponse.json({ message: "Accès refusé" }, { status: 403 });

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: "Fichier manquant" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public/uploads/transfers");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), buffer);

    const receiptUrl = `/uploads/transfers/${fileName}`;

    await prisma.payment.upsert({
      where: { orderId: ordersId },
      update: { method: "transfer", status: "pending", receiptUrl },
      create: {
        orderId: ordersId,
        method: "transfer",
        status: "pending",
        amount: order.video.price,
        receiptUrl,
      },
    });

    return NextResponse.json({ message: "Virement envoyé, en attente de validation" });
  } catch (e) {
    console.error("PAY TRANSFER ERROR:", e);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
