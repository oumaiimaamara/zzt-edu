// app/api/admin/categories/[id]/route.ts
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

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
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

type Params = { params: { id: string } };

/* PATCH – update name and/or parentId */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = params;
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const parentId: string | null = body?.parentId ?? null;

    if (!name) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });

    const baseSlug = slugify(name);
    if (!baseSlug) return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });

    // Cannot set itself as parent
    if (parentId === id) {
      return NextResponse.json({ error: "SELF_PARENT" }, { status: 400 });
    }

    // Validate parentId
    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true },
      });
      if (!parentExists) {
        return NextResponse.json({ error: "PARENT_NOT_FOUND" }, { status: 404 });
      }
      // Simple cycle check: parent cannot be a descendant of this category
      // (only needed if you have deep nesting; for two-level trees this is sufficient)
      if (parentExists.parentId === id) {
        return NextResponse.json({ error: "CIRCULAR_REFERENCE" }, { status: 400 });
      }
    }

    // Check name uniqueness within same parent (excluding self)
    const existingByName = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        parentId: parentId ?? null,
        NOT: { id },
      },
      select: { id: true },
    });
    if (existingByName) {
      return NextResponse.json({ error: "CATEGORY_ALREADY_EXISTS" }, { status: 409 });
    }

    const slug = await uniqueSlug(baseSlug, id);

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, parentId: parentId ?? null },
    });

    return NextResponse.json({ category });
  } catch (e: any) {
    console.error("CATEGORIES_PATCH_FAILED:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "CATEGORIES_PATCH_FAILED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

/* DELETE – remove category (blocks if it has children) */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = params;
  try {
    // Block deletion if category has children
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      return NextResponse.json(
        { error: "HAS_CHILDREN", count: childCount },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (e: any) {
    console.error("CATEGORIES_DELETE_FAILED:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "CATEGORIES_DELETE_FAILED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}