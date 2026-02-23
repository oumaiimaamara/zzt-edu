import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

/* =========================
   GET — détail réservation
========================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  const reservation = await prisma.oneToOneRequest.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      professional: { select: { name: true, specialty: true } },
      course: {
        select: {
          title: true,
          slug: true,
          coverImageUrl: true,
        },
      },
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { message: "Réservation introuvable" },
      { status: 404 }
    );
  }

  return NextResponse.json(reservation);
}

/* =========================
   PATCH — valider / annuler
========================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json(); 
  // action = "validate" | "cancel"

  const reservation = await prisma.oneToOneRequest.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json(
      { message: "Réservation introuvable" },
      { status: 404 }
    );
  }

  /* 🔹 VALIDATION */
  if (action === "validate") {
    await prisma.$transaction([
      prisma.oneToOneRequest.update({
        where: { id },
        data: { status: "VALIDATED" },
      }),
      prisma.availabilitySlot.updateMany({
        where: {
          professionalId: reservation.professionalId,
          startTime: reservation.scheduledAt,
        },
        data: {
          status: "booked",
        },
      }),
    ]);
  }

  /* 🔹 ANNULATION */
  if (action === "cancel") {
    await prisma.$transaction([
      prisma.oneToOneRequest.update({
        where: { id },
        data: { status: "CANCELLED" },
      }),
      prisma.availabilitySlot.updateMany({
        where: {
          professionalId: reservation.professionalId,
          startTime: reservation.scheduledAt,
        },
        data: {
          status: "available",
        },
      }),
    ]);
  }

  return NextResponse.json({ success: true });
}
