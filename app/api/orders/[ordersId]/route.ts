import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ ordersId: string }> }
) {
  const user = await getUserFromCookies();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { ordersId } = await ctx.params;

  const order = await prisma.order.findUnique({
    where: { id: ordersId },
    include: { video: true, payment: true },
  });

  if (!order || order.userId !== user.userId) {
    return new Response("Forbidden", { status: 403 });
  }

  return Response.json(order);
}
