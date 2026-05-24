import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/authFromRequest";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Token manquant ou invalide" }, { status: 401 });
    }

    const data = await req.json();
    const { professionalId, date, message } = data;

    if (!professionalId || !date) {
      return NextResponse.json(
        { message: "Nom du professionnel et date sont obligatoires." },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return NextResponse.json({ message: "Utilisateur introuvable dans la DB." }, { status: 404 });
    }

    const professionalExists = await prisma.professional.findUnique({ where: { id: professionalId } });
    if (!professionalExists) {
      return NextResponse.json({ message: "Professionnel introuvable." }, { status: 404 });
    }

    const reservation = await prisma.oneToOneRequest.create({
      data: {
        user: { connect: { id: userId } },
        professional: { connect: { id: professionalId } },
        scheduledAt: new Date(date),
        message: message || "",
        status: "pending",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Réservation enregistrée !", reservation }, { status: 200 });
  } catch (error) {
    console.error("Erreur POST /one-to-one :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}