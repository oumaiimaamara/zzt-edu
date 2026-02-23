import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function slugify(input: string) {
  return input
    .normalize("NFD") // enlève accents
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================
   GET – list categories
========================= */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (e) {
    console.error("CATEGORIES_GET_FAILED:", e);
    return NextResponse.json(
      { error: "CATEGORIES_GET_FAILED" },
      { status: 500 }
    );
  }
}

/* =========================
   POST – create category
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
    }

    const baseSlug = slugify(name);
    if (!baseSlug) {
      return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });
    }

    // Empêche doublons name (insensitive)
    const existingByName = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingByName) {
      return NextResponse.json(
        { error: "CATEGORY_ALREADY_EXISTS" },
        { status: 409 }
      );
    }

    // Empêche doublons slug (et crée un slug unique si besoin)
    let slug = baseSlug;
    let i = 2;

    while (true) {
      const existsSlug = await prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existsSlug) break;
      slug = `${baseSlug}-${i++}`;
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (e: any) {
    console.error("CATEGORIES_POST_FAILED:", e);

    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "CATEGORY_ALREADY_EXISTS" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "CATEGORIES_POST_FAILED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

/*import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function slugify(input: string) {
  return input
    .normalize("NFD") // enlève accents
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
    }

    const baseSlug = slugify(name);
    if (!baseSlug) {
      return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });
    }

    // Empêche doublons name (insensitive)
    const existingByName = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (existingByName) {
      return NextResponse.json({ error: "CATEGORY_ALREADY_EXISTS" }, { status: 409 });
    }

    // Empêche doublons slug (et crée un slug unique si besoin)
    let slug = baseSlug;
    let i = 2;
    while (true) {
      const existsSlug = await prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existsSlug) break;
      slug = `${baseSlug}-${i++}`;
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (e: any) {
    console.error("CATEGORIES_POST_FAILED:", e);

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "CATEGORY_ALREADY_EXISTS" }, { status: 409 });
    }

    return NextResponse.json(
      { error: "CATEGORIES_POST_FAILED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}





/*import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (e) {
    return NextResponse.json({ error: "CATEGORIES_GET_FAILED" }, { status: 500 });
  }
}*/
