import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth"; // ta fonction pour décoder le token et récupérer l'userId
import jwt from "jsonwebtoken";
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Token manquant", { status: 401 });

  const token = authHeader.split(" ")[1];
  let payload: any;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return new Response("Token invalide", { status: 401 });
  }

  const { orderId, paymentMethod, status } = await req.json();

  const payment = await prisma.payment.create({
    data: {
      orderId,
      userId: payload.id,
      method: paymentMethod,
      status,
    },
  });

  return new Response(JSON.stringify(payment), { status: 201 });
}
