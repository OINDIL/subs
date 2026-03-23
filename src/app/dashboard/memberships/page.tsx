"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Membership {
  id: string;
  name: string;
  email: string;
  subscription: {
    id: string;
    name: string;
    description: string | null;
    costPerMember: number;
    currency: string;
    billingDay: number;
    qrCodeUrl: string | null;
    owner: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
    _count: { members: number };
  };
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemberships = useCallback(async () => {
    try {
      const res = await fetch("/api/memberships");
      if (res.ok) {
        const data = await res.json();
        setMemberships(data);
      }
    } catch {
      toast.error("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const getNextBillingDate = (billingDay: number) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), billingDay);
    if (thisMonth > now) {
      return thisMonth.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
    return nextMonth.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Memberships</h1>
        <p className="text-muted-foreground mt-1">
          Subscriptions you&apos;re a member of
        </p>
      </div>

      {memberships.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="text-lg font-semibold mb-1">No memberships yet</h3>
            <p className="text-muted-foreground text-sm">
              When someone adds you to their subscription, it&apos;ll appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {memberships.map((m) => (
            <Card
              key={m.id}
              className="hover:border-violet-500/30 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {m.subscription.name}
                    </CardTitle>
                    {m.subscription.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {m.subscription.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {m.subscription._count.members} members
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Amount Due</p>
                    <p className="font-semibold">
                      {m.subscription.currency === "INR" ? "₹" : m.subscription.currency}
                      {m.subscription.costPerMember.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Next Billing</p>
                    <p className="font-medium text-violet-400">
                      {getNextBillingDate(m.subscription.billingDay)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Owner</p>
                    <p className="font-medium">{m.subscription.owner.name}</p>
                  </div>
                </div>

                {m.subscription.qrCodeUrl && (
                  <div className="mt-4 p-4 rounded-lg bg-accent/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-3 text-center">
                      Scan to pay
                    </p>
                    <div className="flex justify-center">
                      <Image
                        src={m.subscription.qrCodeUrl}
                        alt="Payment QR Code"
                        width={192}
                        height={192}
                        className="rounded-lg object-contain bg-white p-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
