"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Subscription {
  id: string;
  name: string;
  description: string | null;
  costPerMember: number;
  currency: string;
  billingDay: number;
  qrCodeUrl: string | null;
  _count: { members: number };
  createdAt: string;
}

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    costPerMember: "",
    currency: "INR",
    billingDay: "",
    qrCodeBase64: "",
  });

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await fetch("/api/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, qrCodeBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Subscription created!");
        setDialogOpen(false);
        setForm({
          name: "",
          description: "",
          costPerMember: "",
          currency: "INR",
          billingDay: "",
          qrCodeBase64: "",
        });
        fetchSubscriptions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create subscription");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your shared subscription plans
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 gap-2" />}
          >
            <span className="text-lg">+</span> New Subscription
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Subscription</DialogTitle>
              <DialogDescription>
                Add a new subscription plan to manage and share with members.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Subscription Name</Label>
                <Input
                  id="sub-name"
                  placeholder="e.g., YouTube Premium Family"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-desc">Description (optional)</Label>
                <Textarea
                  id="sub-desc"
                  placeholder="Brief description of the subscription"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sub-cost">Cost per Member</Label>
                  <Input
                    id="sub-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="49.00"
                    value={form.costPerMember}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        costPerMember: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-currency">Currency</Label>
                  <Input
                    id="sub-currency"
                    placeholder="INR"
                    value={form.currency}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, currency: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-billing">Billing Day (1-31)</Label>
                <Input
                  id="sub-billing"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1"
                  value={form.billingDay}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, billingDay: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-qr">Payment QR Code (optional)</Label>
                <Input
                  id="sub-qr"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {form.qrCodeBase64 && (
                  <div className="mt-2 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.qrCodeBase64}
                      alt="QR Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, qrCodeBase64: "" }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-1">No subscriptions yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first subscription to start managing payments
            </p>
            <Button onClick={() => setDialogOpen(true)} variant="outline">
              + Create Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <Link
              key={sub.id}
              href={`/dashboard/subscription/${sub.id}`}
            >
              <Card className="group hover:border-violet-500/30 transition-all duration-300 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base group-hover:text-violet-400 transition-colors">
                      {sub.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {sub._count.members} member{sub._count.members !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {sub.description && (
                    <CardDescription className="text-xs line-clamp-2">
                      {sub.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cost/member</span>
                    <span className="font-semibold">
                      {sub.currency === "INR" ? "₹" : sub.currency}
                      {sub.costPerMember.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Next billing</span>
                    <span className="text-violet-400 font-medium">
                      {getNextBillingDate(sub.billingDay)}
                    </span>
                  </div>
                  {sub.qrCodeUrl && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                      <span>✓</span> QR code attached
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
