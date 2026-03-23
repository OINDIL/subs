import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";

// GET /api/memberships — list subscriptions the current user is a member of
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.member.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email },
        ],
      },
      include: {
        subscription: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, image: true },
            },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(memberships);
  } catch {
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
  }
}
