import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "covers");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";

    const filename = `${crypto.randomUUID()}.${safeExt}`;
    const fullPath = path.join(uploadsDir, filename);

    fs.writeFileSync(fullPath, buffer);

    return NextResponse.json({ imageUrl: `/uploads/covers/${filename}` });
  } catch (err: any) {
    console.error("upload-image error:", err);
    return NextResponse.json(
      { error: "UPLOAD_FAILED", message: err?.message ?? "Unknown" },
      { status: 500 }
    );
  }
}
