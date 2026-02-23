import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ✅ IMPORTANT: répondre proprement si id manquant
    if (!id) {
      return NextResponse.json(
        { message: "Paramètre id manquant." },
        { status: 400 }
      );
    }

    const course = await prisma.video.findUnique({
      where: { id },
      include: { category: true, professional: true },
    });

    if (!course) {
      return NextResponse.json({ message: "Cours introuvable." }, { status: 404 });
    }

    return NextResponse.json({ course }, { status: 200 });
  } catch (err) {
    console.error("GET /api/videos/by-id error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

/*import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "id manquant" }, { status: 400 });
    }

    const course = await prisma.video.findUnique({
      where: { id },
      include: { category: true, professional: true },
    });

    if (!course) {
      return NextResponse.json({ message: "Cours introuvable" }, { status: 404 });
    }

    return NextResponse.json(
      {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          type: course.type,
          slug: course.slug,
          videoUrl: course.videoUrl,
          coverImageUrl: course.coverImageUrl,
          category: {
            id: course.category.id,
            name: course.category.name,
            slug: course.category.slug,
          },
          professional: {
            id: course.professional.id,
            name: course.professional.name,
            specialty: course.professional.specialty,
            photoUrl: course.professional.photoUrl,
          },
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/videos/by-id error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}*/
