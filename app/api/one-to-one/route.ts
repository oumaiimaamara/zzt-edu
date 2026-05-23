import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { professionalId, message, date } = body;

    if (!professionalId) {
      return NextResponse.json({ message: "professionalId manquant" }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        professionalId,
        message: message || null,
        date: date ? new Date(date) : null,
      },
    });

    return NextResponse.json({ reservation }, { status: 200 });
  } catch (err) {
    console.error("POST /api/one-to-one error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}