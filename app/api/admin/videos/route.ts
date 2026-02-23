import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      price,
      videoUrl,
      coverImageUrl, // ✅ AJOUT
      categoryId,
      professionalId,
      type,
      articleContent,
      slug,
    } = body;

    if (!title || !description || price == null || !categoryId || !professionalId) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    // Si tu as une logique de slug ailleurs, garde la tienne.
    // Ici on met un fallback simple si pas envoyé.
    const safeSlug =
      (slug && String(slug).trim()) ||
      String(title)
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/(^-|-$)/g, "");

    const created = await prisma.video.create({
      data: {
        title,
        slug: safeSlug,
        description,
        price: Number(price),
        videoUrl: videoUrl ?? null,
        coverImageUrl: coverImageUrl ? String(coverImageUrl).trim() : null, // ✅ AJOUT
        type: type ?? "VIDEO",
        articleContent: articleContent ?? null,
        category: { connect: { id: categoryId } },
        professional: { connect: { id: professionalId } },
      },
      include: { category: true, professional: true },
    });

    return NextResponse.json({ video: created }, { status: 200 });
  } catch (err) {
    console.error("POST /api/admin/videos error:", err);
    return NextResponse.json({ error: "Erreur serveur création vidéo." }, { status: 500 });
  }
}
