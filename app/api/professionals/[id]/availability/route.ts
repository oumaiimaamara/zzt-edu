import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        professionalId: params.id,
        status: "available",
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
