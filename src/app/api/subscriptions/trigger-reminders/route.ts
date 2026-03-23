import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReminder } from "@/lib/mailer";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Find all subscriptions owned by the user where billingDay <= currentDay
    const subscriptions = await prisma.subscription.findMany({
      where: { 
        ownerId: session.user.id,
        billingDay: { lte: currentDay }
      },
      include: {
        members: true,
        owner: { select: { name: true, email: true } },
      },
    });

    let emailsSent = 0;
    let notificationsCreated = 0;

    for (const subscription of subscriptions) {
      for (const member of subscription.members) {
        // Check if reminder was already sent this month
        const existingLog = await prisma.reminderLog.findUnique({
          where: {
            subscriptionId_memberEmail_billingMonth_billingYear: {
              subscriptionId: subscription.id,
              memberEmail: member.email,
              billingMonth: currentMonth,
              billingYear: currentYear,
            },
          },
        });

        if (existingLog) continue;

        // Send email
        try {
          await sendPaymentReminder({
            to: member.email,
            memberName: member.name,
            subscriptionName: subscription.name,
            amount: subscription.costPerMember,
            currency: subscription.currency,
            ownerName: subscription.owner.name,
            qrCodeUrl: subscription.qrCodeUrl || undefined,
            upiId: subscription.upiId || undefined,
          });

          emailsSent++;

          // Log the reminder
          await prisma.reminderLog.create({
            data: {
              subscriptionId: subscription.id,
              memberEmail: member.email,
              billingMonth: currentMonth,
              billingYear: currentYear,
            },
          });
        } catch (error) {
          console.error(`Failed to send reminder to ${member.email}:`, error);
        }

        // Create in-app notification if member has an account
        if (member.userId) {
          await prisma.notification.create({
            data: {
              userId: member.userId,
              title: `Payment Due: ${subscription.name}`,
              message: `Your payment of ${subscription.currency === "INR" ? "₹" : subscription.currency}${subscription.costPerMember.toFixed(2)} for ${subscription.name} is due. Please pay ${subscription.owner.name}.`,
            },
          });
          notificationsCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: subscriptions.length,
      emailsSent,
      notificationsCreated,
    });
  } catch (error) {
    console.error("Manual trigger error:", error);
    return NextResponse.json({ error: "Failed to trigger reminders" }, { status: 500 });
  }
}
