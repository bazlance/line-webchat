import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();

  const users = await prisma.lineUser.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return Response.json(
    users.map(({ messages, ...user }) => ({
      ...user,
      lastMessage: messages[0] ?? null,
    })),
  );
}
