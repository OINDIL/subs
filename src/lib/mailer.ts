import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface PaymentReminderOptions {
  to: string;
  memberName: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  ownerName: string;
  qrCodeUrl?: string;
  upiId?: string;
}

export async function sendPaymentReminder({
  to,
  memberName,
  subscriptionName,
  amount,
  currency,
  ownerName,
  qrCodeUrl,
  upiId,
}: PaymentReminderOptions) {
  const qrSection = qrCodeUrl || upiId
    ? `
      <div style="text-align: center; margin: 24px 0;">
        <p style="color: #a0aec0; margin-bottom: 12px; font-size: 14px;">Use the UPI ID or scan the QR code below to make your payment:</p>
        ${upiId ? `<p style="color: #f7fafc; font-size: 18px; font-weight: 600; margin-bottom: 16px; letter-spacing: 0.5px;">${upiId}</p>` : ''}
        ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="Payment QR Code" style="width: 250px; height: 250px; border-radius: 12px; border: 2px solid #4a5568;" />` : ''}
      </div>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1a1d2e 0%, #252a3a 100%); border-radius: 16px; padding: 32px; border: 1px solid #2d3348;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f7fafc; font-size: 20px; font-weight: 600; margin: 0;">
              💳 Payment Reminder
            </h1>
          </div>
          
          <div style="background: #0f1117; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin: 0;">
              Hi <strong>${memberName}</strong>,
            </p>
            <p style="color: #a0aec0; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">
              Your payment for <strong style="color: #7c3aed;">${subscriptionName}</strong> is due.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #7c3aed15, #6d28d915); border: 1px solid #7c3aed40; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
            <p style="color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Amount Due</p>
            <p style="color: #f7fafc; font-size: 28px; font-weight: 700; margin: 0;">
              ${currency === "INR" ? "₹" : currency} ${amount.toFixed(2)}
            </p>
          </div>

          ${qrSection}

          <div style="border-top: 1px solid #2d3348; padding-top: 16px; margin-top: 20px;">
            <p style="color: #718096; font-size: 12px; text-align: center; margin: 0;">
              Sent by <strong>${ownerName}</strong> via SubManager
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SubManager" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `Payment Reminder: ${subscriptionName} - ${currency === "INR" ? "₹" : currency}${amount.toFixed(2)}`,
    html,
  });
}

export interface OnboardingEmailOptions {
  to: string;
  memberName: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  ownerName: string;
}

export async function sendOnboardingEmail({
  to,
  memberName,
  subscriptionName,
  amount,
  currency,
  ownerName,
}: OnboardingEmailOptions) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1a1d2e 0%, #252a3a 100%); border-radius: 16px; padding: 32px; border: 1px solid #2d3348;">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f7fafc; font-size: 20px; font-weight: 600; margin: 0;">
              ✨ Welcome to ${subscriptionName}
            </h1>
          </div>
          
          <div style="background: #0f1117; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin: 0;">
              Hi <strong>${memberName}</strong>,
            </p>
            <p style="color: #a0aec0; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">
              <strong>${ownerName}</strong> has added you as a member to the <strong>${subscriptionName}</strong> subscription plan on SubManager.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #7c3aed15, #6d28d915); border: 1px solid #7c3aed40; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
            <p style="color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Cost Per Member</p>
            <p style="color: #f7fafc; font-size: 28px; font-weight: 700; margin: 0;">
              ${currency === "INR" ? "₹" : currency}${amount.toFixed(2)}
            </p>
          </div>

          <div style="border-top: 1px solid #2d3348; padding-top: 16px; margin-top: 20px;">
            <p style="color: #718096; font-size: 12px; text-align: center; margin: 0;">
              Log in to SubManager to view your memberships and payment details.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SubManager" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `You've been added to ${subscriptionName}`,
    html,
  });
}
