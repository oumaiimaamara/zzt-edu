import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email et mot de passe requis" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Identifiants non valides" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { message: "Identifiants non valides" },
      { status: 401 }
    );
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: "ADMIN",
  });

  return NextResponse.json({ token });
}
