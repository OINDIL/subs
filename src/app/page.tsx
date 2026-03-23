"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Users, Bell, Shield } from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-foreground selection:text-background pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm tracking-tighter">S</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">SubManager</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            {session ? (
              <Link href="/dashboard">
                <Button className="rounded-full px-5 h-9 bg-foreground text-background hover:bg-foreground/90 transition-all">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  Log In
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-full px-5 h-9 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full relative flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/10 dark:bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border hover:border-foreground/20 transition-colors text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
              Introducing SubManager 1.0 <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] mb-8">
              Manage Family <br />
              <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">Subscriptions</span>
            </h1>

            <p className="text-lg sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Your central hub for tracking shared expenses. Add members, automate payment reminders, and never chase money again.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link href={session ? "/dashboard" : "/sign-up"} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl">
                  Start Managing
                </Button>
              </Link>
              <Link href="https://github.com" target="_blank" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-full border-border bg-transparent hover:bg-muted transition-colors">
                  View Repository
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Everything you need to stay organized</h2>
            <p className="text-muted-foreground text-lg">Powerful features wrapped in an intuitive interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Large spanning */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] border border-border bg-card/50 p-10 hover:border-foreground/20 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border shadow-sm">
                  <Users className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Add Members & Track Split Costs</h3>
                <p className="text-muted-foreground text-lg max-w-md">Seamlessly invite family and friends to your subscription plans. SubManager automatically calculates who owes what.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-card/50 p-10 hover:border-foreground/20 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border shadow-sm">
                  <Bell className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">Auto Reminders</h3>
                <p className="text-muted-foreground">Automated email reminders trigger perfectly on your billing date.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-card/50 p-10 hover:border-foreground/20 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border shadow-sm">
                  <CreditCard className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">Payment Links</h3>
                <p className="text-muted-foreground">Attach your personal UPI or payment QR code to every notification.</p>
              </div>
            </div>

            {/* Feature 4 - Large spanning */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] border border-border bg-card/50 p-10 hover:border-foreground/20 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border shadow-sm">
                  <Shield className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Secure & Private</h3>
                <p className="text-muted-foreground text-lg max-w-md">Your subscription data and member details are encrypted and securely stored. We don&apos;t process payments directly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-[10px] tracking-tighter">S</span>
            </div>
            <span className="font-semibold text-sm tracking-tight text-muted-foreground">SubManager</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SubManager. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
