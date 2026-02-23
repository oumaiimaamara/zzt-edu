import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function GET() {
  const auth = await getUserFromCookies();

  if (!auth) {
    return NextResponse.json(
      { message: "Token manquant" },
      { status: 401 }
    );
  }

  if (auth.role.toLowerCase() !== "admin") {
    return NextResponse.json(
      { message: "Accès refusé (admin requis)" },
      { status: 403 }
    );
  }

  const reservations = await prisma.oneToOneRequest.findMany({
    include: {
      user: { select: { name: true, email: true } },
      professional: { select: { name: true, specialty: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reservations });
}
