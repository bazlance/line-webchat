import { connection } from "next/server";
import { lineClient } from "@/lib/line";
import { prisma } from "@/lib/prisma";

const MAX_TEXT_LENGTH = 5000; // LINE text message limit

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/users/[id]/messages">,
) {
  await connection();
  const { id } = await ctx.params;

  const messages = await prisma.message.findMany({
    where: { lineUserId: id },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(messages);
}

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/users/[id]/messages">,
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    text?: unknown;
  } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return Response.json({ error: "Message is empty" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: "Message is too long" }, { status: 400 });
  }

  const user = await prisma.lineUser.findUnique({ where: { id } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await lineClient.pushMessage({
      to: id,
      messages: [{ type: "text", text }],
    });
  } catch (err) {
    console.error("Failed to push LINE message", err);
    return Response.json(
      { error: "Failed to send message to LINE" },
      { status: 502 },
    );
  }

  const message = await prisma.message.create({
    data: { lineUserId: id, direction: "OUTGOING", type: "text", text },
  });

  await prisma.lineUser.update({
    where: { id },
    data: { lastMessageAt: message.createdAt },
  });

  return Response.json(message, { status: 201 });
}
