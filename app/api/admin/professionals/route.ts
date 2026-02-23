import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const professionals = await prisma.professional.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ professionals });
  } catch (e) {
    return NextResponse.json({ error: "PROS_GET_FAILED" }, { status: 500 });
  }
}
