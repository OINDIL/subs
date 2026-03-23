import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-session";
import { uploadQRCode, deleteQRCode, getPublicIdFromUrl } from "@/lib/cloudinary";

// GET /api/subscriptions/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Only owner or members can view
    const isMember = subscription.members.some(
      (m) => m.userId === session.user.id || m.email === session.user.email
    );
    if (subscription.ownerId !== session.user.id && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(subscription);
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}

// PUT /api/subscriptions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, costPerMember, currency, billingDay, qrCodeBase64, upiId, deleteQrCode } = body;

    let qrCodeUrl = existing.qrCodeUrl;

    if (deleteQrCode) {
      if (existing.qrCodeUrl) {
        try {
          const publicId = getPublicIdFromUrl(existing.qrCodeUrl);
          await deleteQRCode(publicId);
        } catch {
          // ignore delete error
        }
      }
      qrCodeUrl = null;
    } else if (qrCodeBase64) {
      // Delete old QR code if exists
      if (existing.qrCodeUrl) {
        try {
          const publicId = getPublicIdFromUrl(existing.qrCodeUrl);
          await deleteQRCode(publicId);
        } catch {
          // ignore delete error
        }
      }
      qrCodeUrl = await uploadQRCode(qrCodeBase64);
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(costPerMember && { costPerMember: parseFloat(costPerMember) }),
        ...(currency && { currency }),
        ...(billingDay && { billingDay: parseInt(billingDay) }),
        ...(upiId !== undefined && { upiId: upiId === "" ? null : upiId }),
        qrCodeUrl,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}

// DELETE /api/subscriptions/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (subscription.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete QR code from Cloudinary
    if (subscription.qrCodeUrl) {
      try {
        const publicId = getPublicIdFromUrl(subscription.qrCodeUrl);
        await deleteQRCode(publicId);
      } catch {
        // ignore delete error
      }
    }

    await prisma.subscription.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 });
  }
}
