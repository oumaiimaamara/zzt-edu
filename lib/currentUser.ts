import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded?.userId ?? null;
}