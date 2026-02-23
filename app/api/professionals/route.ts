// app/api/professionals/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ton client Prisma

export async function GET() {
  try {
    const professionals = await prisma.professional.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(professionals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur lors de la récupération des professionnels." }, { status: 500 });
  }
}
