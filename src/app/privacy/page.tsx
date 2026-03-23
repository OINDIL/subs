import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full pb-20">
        <Link href="/">
          <Button variant="ghost" className="-ml-4 mb-8 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: March 2026</p>
        
        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, such as your name, email address, profile image, and authentication credentials. We also collect data about the subscriptions you manage and the members you add.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Information</h2>
            <p>
              We use the information we collect to operate, maintain, and improve our services, send you technical notices and support messages, and communicate with you about subscription management and payment reminders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Sharing of Information</h2>
            <p>
              We do not sell your personal data. We may share limited information with service providers who perform services on our behalf (such as email delivery via SMTP or image hosting via Cloudinary). Information about subscriptions (such as UPI IDs and QR codes) is only shared with verified members of those specific subscriptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us or delete your account data directly from your profile settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
