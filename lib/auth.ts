import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function signToken(payload: { userId: string; email?: string; role?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    const userId =
      (decoded?.userId as string) ||
      (decoded?.id as string) ||
      (decoded?.sub as string) ||
      null;
    if (!userId) return null;
    return { userId: String(userId) };
  } catch {
    return null;
  }
}