import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ReservationTable from "./ReservationTable";

export default async function AdminReservationsPage() {
  const token = (await cookies()).get("auth_token")?.value;

  if (!token) redirect("/admin/login");

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    if (decoded.role !== "admin") {
      redirect("/admin/login");
    }
  } catch {
    redirect("/admin/login");
  }

  return (
    <main className="p-6">
      <ReservationTable />
    </main>
  );
}
