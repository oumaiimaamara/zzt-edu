import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const videoId = url.searchParams.get("videoId") || "";

  if (!videoId) {
    return NextResponse.json({ reviews: [] }, { status: 200 });
  }

  const reviews = await prisma.review.findMany({
    where: { videoId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ reviews }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded?.userId;

    if (!userId) {
      return NextResponse.json({ message: "Utilisateur non trouvé." }, { status: 401 });
    }

    const body = await req.json();
    const { videoId, rating, message } = body;

    if (!videoId || !message || !rating) {
      return NextResponse.json({ message: "Champs manquants." }, { status: 400 });
    }

    // ✅ vérif achat réel : Library
    const bought = await prisma.library.findFirst({
      where: { userId, videoId },
      select: { id: true },
    });

    if (!bought) {
      return NextResponse.json(
        { message: "Vous devez acheter ce cours pour laisser un avis." },
        { status: 403 }
      );
    }

    const r = Math.max(1, Math.min(5, Number(rating)));

    // Option: empêcher spam (1 avis par user par cours)
    const already = await prisma.review.findFirst({
      where: { userId, videoId },
      select: { id: true },
    });

    if (already) {
      return NextResponse.json(
        { message: "Vous avez déjà publié un avis pour ce cours." },
        { status: 409 }
      );
    }

    const created = await prisma.review.create({
      data: {
        userId,
        videoId,
        rating: r,
        message: String(message).trim(),
      },
    });

    return NextResponse.json({ review: created }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
