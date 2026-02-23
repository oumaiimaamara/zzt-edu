import { cookies } from "next/headers";

export async function getCurrentUserId(): Promise<string | null> {
  return (await cookies()).get("userId")?.value ?? null;
}
