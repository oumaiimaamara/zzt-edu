import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/currentUser";

export async function GET(_: Request, { params }: { params: { videoId: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ hasAccess: false, isLoggedIn: false });

    const inLibrary = await prisma.library.findUnique({
      where: { userId_videoId: { userId, videoId: params.videoId } },
    });

    const paidOrder = await prisma.order.findFirst({
      where: { userId, videoId: params.videoId, status: "paid" },
    });

    return NextResponse.json({ hasAccess: !!inLibrary || !!paidOrder, isLoggedIn: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ hasAccess: false, isLoggedIn: false }, { status: 500 });
  }
}
