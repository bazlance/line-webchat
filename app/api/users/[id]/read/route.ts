import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/users/[id]/read">,
) {
  const { id } = await ctx.params;

  await prisma.lineUser.updateMany({
    where: { id },
    data: { unreadCount: 0 },
  });

  return Response.json({ ok: true });
}
