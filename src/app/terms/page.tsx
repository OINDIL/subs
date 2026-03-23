import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full pb-20">
        <Link href="/">
          <Button variant="ghost" className="-ml-4 mb-8 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">Last Updated: March 2026</p>
        
        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SubManager, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              SubManager provides a platform for users to manage shared subscriptions, track costs, and send payment reminders. We do not process payments directly; we only facilitate communication and tracking between subscription members.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You also agree to use the service for lawful purposes only and not to use it to harass, abuse, or engage in fraudulent activities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Disclaimer of Warranties</h2>
            <p>
              The service is provided &quot;as is&quot; without any warranties, expressed or implied. We do not guarantee uninterrupted access to the service or that it will be completely error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or through prominent notices on our platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
