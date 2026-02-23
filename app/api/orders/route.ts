import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookies();

    if (!user) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { message: "Données manquantes" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        videoId,
        status: "pending",
      },
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
