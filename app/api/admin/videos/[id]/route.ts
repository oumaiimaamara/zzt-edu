import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// UPDATE video
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const {
      title,
      description,
      price,
      videoUrl,
      coverImageUrl,
      categoryId,
      professionalId,
      type,
      articleContent,
      slug,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    // Vérifier que la vidéo existe
    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });
    }

    const safeSlug =
      (slug && String(slug).trim()) ||
      (title
        ? String(title)
            .toLowerCase()
            .trim()
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/(^-|-$)/g, "")
        : existing.slug);

    const updated = await prisma.video.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug: safeSlug,
        description: description ?? existing.description,
        price: price != null ? Number(price) : existing.price,
        videoUrl: videoUrl ?? existing.videoUrl,
        coverImageUrl: coverImageUrl ?? existing.coverImageUrl,
        type: type ?? existing.type,
        articleContent:
          type === "ARTICLE" ? articleContent ?? existing.articleContent : null,
        category:
          categoryId ? { connect: { id: categoryId } } : undefined,
        professional:
          professionalId ? { connect: { id: professionalId } } : undefined,
      },
      include: { category: true, professional: true },
    });

    return NextResponse.json({ video: updated }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/admin/videos/[id] error:", err);
    return NextResponse.json(
      { error: "Erreur serveur mise à jour vidéo." },
      { status: 500 }
    );
  }
}
