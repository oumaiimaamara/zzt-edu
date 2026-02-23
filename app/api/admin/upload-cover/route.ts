import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier cover manquant." }, { status: 400 });
    }

    // Sécurité / types acceptés
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG/PNG/WEBP." },
        { status: 400 }
      );
    }

    // Extension
    const ext =
      file.type === "image/jpeg" ? "jpg" :
      file.type === "image/png" ? "png" :
      "webp";

    const filename = `${randomUUID()}.${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "covers");
    await fs.mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dest = path.join(uploadsDir, filename);
    await fs.writeFile(dest, buffer);

    // URL publique (IMPORTANT: commence par /)
    const coverImageUrl = `/uploads/covers/${filename}`;

    return NextResponse.json({ coverImageUrl }, { status: 200 });
  } catch (err) {
    console.error("upload-cover error:", err);
    return NextResponse.json({ error: "Erreur serveur upload cover." }, { status: 500 });
  }
}
