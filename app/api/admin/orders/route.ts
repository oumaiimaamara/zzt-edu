import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function requireAdmin(req: Request) {
  // 1) cookie userId (comme ton purchase)
  const cookieUserId = (await cookies()).get("userId")?.value ?? null;

  // 2) ou Bearer token (comme tes pay routes)
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const decoded = token ? await verifyToken(token) : null;

  const userId = cookieUserId || decoded?.userId || null;
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user || user.role !== "ADMIN") return null;

  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

    const url = new URL(req.url);
    const status = (url.searchParams.get("status") || "new").toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Filtres demandés:
    // - new: nouvelles commandes (pending + pas encore payées)
    // - to_validate: pending + payment.method=transfer + payment.status=pending
    // - failed: failed/cancelled OU payment failed
    // - done: paid OU payment paid
    const where: any = {};

    if (status === "to_validate") {
      where.status = "pending";
      where.payment = { is: { method: "transfer", status: "pending" } };
    } else if (status === "done") {
      where.OR = [
        { status: "paid" },
        { payment: { is: { status: "paid" } } },
      ];
    } else if (status === "failed") {
      where.OR = [
        { status: { in: ["failed", "cancelled"] } },
        { payment: { is: { status: "failed" } } },
      ];
    } else {
      // "new"
      where.status = "pending";
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } },
          video: { select: { title: true, price: true } },
          payment: { select: { method: true, status: true, receiptUrl: true, amount: true, paidAt: true } },
        },
      }),
    ]);

    const items = orders.map((o) => ({
      id: o.id,
      customerName: o.user?.name || o.user?.email || "—",
      date: o.createdAt,
      status: o.status, // pending | paid | failed | cancelled
      amount: o.payment?.amount ?? o.video?.price ?? 0,
      courseTitle: o.video?.title ?? "—",
      paymentMethod: o.payment?.method ?? null,
      paymentStatus: o.payment?.status ?? null,
      receiptUrl: o.payment?.receiptUrl ?? null,
    }));

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (e) {
    console.error("GET /api/admin/orders error:", e);
    return NextResponse.json({ error: "ADMIN_ORDERS_GET_FAILED" }, { status: 500 });
  }
}
