import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getUserFromCookies();

  if (!user) {
    return NextResponse.json(
      { message: "Non authentifié" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const {
    professionalId,
    date,
    message,
    courseId, // optionnel
  } = body;

  if (!professionalId || !date) {
    return NextResponse.json(
      { message: "Données manquantes" },
      { status: 400 }
    );
  }

  const scheduledAt = new Date(date);

  try {
    const reservation = await prisma.oneToOneRequest.create({
      data: {
        userId: user.id,
        professionalId,
        scheduledAt,
        message,
        status: "pending",
        ...(courseId && { courseId }),
      },
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("ERREUR RESERVATION:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
