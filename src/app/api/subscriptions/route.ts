import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";
import { uploadQRCode } from "@/lib/cloudinary";

// GET /api/subscriptions — list owner's subscriptions
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { ownerId: session.user.id },
      include: {
        members: true,
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscriptions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

// POST /api/subscriptions — create a new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, costPerMember, currency, billingDay, qrCodeBase64 } = body;

    if (!name || !costPerMember || !billingDay) {
      return NextResponse.json(
        { error: "Name, cost per member, and billing day are required" },
        { status: 400 }
      );
    }

    if (billingDay < 1 || billingDay > 31) {
      return NextResponse.json(
        { error: "Billing day must be between 1 and 31" },
        { status: 400 }
      );
    }

    let qrCodeUrl: string | undefined;
    if (qrCodeBase64) {
      qrCodeUrl = await uploadQRCode(qrCodeBase64);
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        description: description || null,
        costPerMember: parseFloat(costPerMember),
        currency: currency || "INR",
        billingDay: parseInt(billingDay),
        qrCodeUrl: qrCodeUrl || null,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
