import { verifyToken } from "@/lib/auth";

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  // 1. Header Authorization
  const authHeader = req.headers.get("Authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (bearerToken) {
    const decoded = await verifyToken(bearerToken);
    if (decoded?.userId) return decoded.userId;
  }

  // 2. Cookie HTTP-only "token"
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  const cookieToken = tokenMatch ? decodeURIComponent(tokenMatch[1]) : "";

  if (cookieToken) {
    const decoded = await verifyToken(cookieToken);
    if (decoded?.userId) return decoded.userId;
  }

  return null;
}