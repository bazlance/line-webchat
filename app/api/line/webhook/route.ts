import type { webhook } from "@line/bot-sdk";
import { Prisma } from "@/app/generated/prisma/client";
import { lineClient, verifySignature } from "@/lib/line";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // signature is computed from the raw body, so read it as text first
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!verifySignature(body, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { events } = JSON.parse(body) as webhook.CallbackRequest;

  for (const event of events) {
    try {
      await handleEvent(event);
    } catch (err) {
      console.error("Failed to handle LINE event", err);
    }
  }

  return Response.json({ ok: true });
}

async function handleEvent(event: webhook.Event) {
  if (event.source?.type !== "user" || !event.source.userId) return;
  const userId = event.source.userId;

  if (event.type === "follow") {
    await saveUser(userId);
    return;
  }

  if (event.type !== "message") return;

  await saveUser(userId);

  const message = event.message;
  const text = message.type === "text" ? message.text : `[${message.type}]`;

  try {
    await prisma.message.create({
      data: {
        lineUserId: userId,
        direction: "INCOMING",
        type: message.type,
        text,
        lineMessageId: message.id,
        createdAt: new Date(event.timestamp),
      },
    });
  } catch (err) {
    // LINE may resend the same event; skip messages we already saved
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return;
    }
    throw err;
  }

  await prisma.lineUser.update({
    where: { id: userId },
    data: {
      lastMessageAt: new Date(event.timestamp),
      unreadCount: { increment: 1 },
    },
  });
}

async function saveUser(userId: string) {
  const profile = await lineClient.getProfile(userId).catch((err) => {
    console.error("Failed to get LINE profile", err);
    return null;
  });

  const data = {
    displayName: profile?.displayName ?? "LINE user",
    pictureUrl: profile?.pictureUrl ?? null,
  };

  await prisma.lineUser.upsert({
    where: { id: userId },
    update: profile ? data : {},
    create: { id: userId, ...data },
  });
}
