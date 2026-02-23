import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const professionalId = params.id;

    const body = await req.json();
    const { date } = body; // "2026-01-20"

    if (!date) {
      return NextResponse.json({ message: "Date requise" }, { status: 400 });
    }

    const startDay = new Date(`${date}T08:00:00`);
    const endDay = new Date(`${date}T17:00:00`);

    const slots = [];
    let cursor = new Date(startDay);

    while (cursor < endDay) {
      const next = new Date(cursor.getTime() + 30 * 60000);

      slots.push({
        professionalId,
        startTime: cursor,
        endTime: next,
      });

      cursor = next;
    }

    await prisma.availabilitySlot.createMany({
      data: slots,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: "Créneaux générés",
      count: slots.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
