import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";

export async function GET() {
  const auth = await getUserFromCookies();

  if (!auth || auth.role.toLowerCase() !== "admin") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
