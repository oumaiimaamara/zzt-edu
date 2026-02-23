import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ReservationEdit from "./ReservationEdit";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function AdminReservationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/admin/login");

  const decoded = jwt.verify(token, JWT_SECRET) as any;
  if (decoded.role !== "admin") redirect("/admin/login");

  const { id } = await params;

  return <ReservationEdit reservationId={id} />;
}
