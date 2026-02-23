import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe obligatoire." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ message: "Mot de passe incorrect" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    //  Ajout cookie HTTP-only pour que /api/library puisse authentifier
    const res = NextResponse.json(
      {
        message: "Login OK",
        token, // (tu peux le garder pour le localStorage si tu veux)
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return res;
  } catch (err) {
    console.error("POST /api/users/login error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
