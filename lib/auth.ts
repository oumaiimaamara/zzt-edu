import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: {
  userId: string;
  email: string;
  role: string;
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getUserFromCookies() {
  const cookieStore = await cookies(); // NEXT 15 FIX

  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  return verifyToken(token) as any;
}