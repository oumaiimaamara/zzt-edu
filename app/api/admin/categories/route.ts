import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (true) {
    const exists = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!exists || exists.id === excludeId) break;
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true },
    });
    return NextResponse.json({ categories });
  } catch (e) {
    console.error("CATEGORIES_GET_FAILED:", e);
    return NextResponse.json({ error: "CATEGORIES_GET_FAILED" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const parentId: string | null = body?.parentId ?? null;

    if (!name) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });

    const baseSlug = slugify(name);
    if (!baseSlug) return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });

    const existingByName = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        parentId: parentId ?? null,
      },
      select: { id: true },
    });
    if (existingByName) {
      return NextResponse.json({ error: "CATEGORY_ALREADY_EXISTS" }, { status: 409 });
    }

    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parentExists) {
        return NextResponse.json({ error: "PARENT_NOT_FOUND" }, { status: 404 });
      }
    }

    const slug = await uniqueSlug(baseSlug);

    const category = await prisma.category.create({
      data: { name, slug, parentId: parentId ?? null },
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