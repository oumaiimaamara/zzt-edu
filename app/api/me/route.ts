import { getUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getUserFromCookies();

  if (!auth) {
    return Response.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  return Response.json({ user });
}