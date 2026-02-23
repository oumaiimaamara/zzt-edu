import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/currentUser";
import fs from "fs";
import path from "path";

export async function GET(req: Request, { params }: { params: { videoId: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  const video = await prisma.video.findUnique({ where: { id: params.videoId } });
  if (!video) return NextResponse.json({ error: "VIDEO_NOT_FOUND" }, { status: 404 });

  const inLibrary = await prisma.library.findUnique({
    where: { userId_videoId: { userId, videoId: video.id } },
  });
  const paidOrder = await prisma.order.findFirst({
    where: { userId, videoId: video.id, status: "paid" },
  });
  if (!inLibrary && !paidOrder) return NextResponse.json({ error: "NO_ACCESS" }, { status: 403 });

  const filePath = video.videoUrl.startsWith("/uploads/")
    ? path.join(process.cwd(), "public", video.videoUrl)
    : path.join(process.cwd(), video.videoUrl);

  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });

  const stat = fs.statSync(filePath);
  const range = req.headers.get("range");
  const contentType = "video/mp4";

  if (!range) {
    const stream = fs.createReadStream(filePath);
    return new Response(stream as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  }

  const parts = range.replace("bytes=", "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

  const chunkSize = end - start + 1;
  const stream = fs.createReadStream(filePath, { start, end });

  return new Response(stream as any, {
    status: 206,
    headers: {
      "Content-Type": contentType,
      "Content-Length": chunkSize.toString(),
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
    },
  });
}
