import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromCookies();

  if (!user) {
    return NextResponse.json(
      { message: "Non authentifié" },
      { status: 401 }
    );
  }

  const library = await prisma.library.findMany({
    where: { userId: user.id },
    include: {
      video: true,
    },
  });

  return NextResponse.json({ library });
}
