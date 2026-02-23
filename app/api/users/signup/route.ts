import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth"; // ta fonction pour décoder le token et récupérer l'userId
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return new Response("Email déjà utilisé", { status: 400 });
  }

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  return new Response(JSON.stringify(user), { status: 201 });
}
