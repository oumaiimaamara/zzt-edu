import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface PaymentBody {
  orderId: string;
  paymentMethod: string;
  status: string;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Token manquant", { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token);

  if (!user) {
    return new Response("Token invalide", { status: 401 });
  }

  const body: PaymentBody = await req.json();
  const { orderId, paymentMethod, status } = body;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { video: true }, // ✅ nécessaire
  });

  if (!order || order.userId !== user.userId) {
    return new Response("Accès refusé", { status: 403 });
  }

  const payment = await prisma.payment.upsert({
    where: { orderId },
    update: {
      method: paymentMethod,
      status,
    },
    create: {
      orderId,
      amount: order.video.price, // ✅ correct
      method: paymentMethod,
      status,
    },
  });

  return new Response(JSON.stringify(payment), { status: 201 });
}
