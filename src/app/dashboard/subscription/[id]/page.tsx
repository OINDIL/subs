"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
  userId: string | null;
  user: { id: string; name: string; email: string; image: string | null } | null;
  createdAt: string;
}

interface SubscriptionDetail {
  id: string;
  name: string;
  description: string | null;
  costPerMember: number;
  currency: string;
  billingDay: number;
  qrCodeUrl: string | null;
  ownerId: string;
  owner: { id: string; name: string; email: string; image: string | null };
  members: Member[];
  createdAt: string;
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", email: "" });
  const [addingMember, setAddingMember] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    costPerMember: "",
    currency: "",
    billingDay: "",
    qrCodeBase64: "",
  });
  const [saving, setSaving] = useState(false);

  const isOwner = session?.user?.id === subscription?.ownerId;

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch(`/api/subscriptions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
        setEditForm({
          name: data.name,
          description: data.description || "",
          costPerMember: data.costPerMember.toString(),
          currency: data.currency,
          billingDay: data.billingDay.toString(),
          qrCodeBase64: "",
        });
      } else if (res.status === 404) {
        toast.error("Subscription not found");
        router.push("/dashboard");
      } else {
        toast.error("Failed to load subscription");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const res = await fetch(`/api/subscriptions/${params.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });

      if (res.ok) {
        toast.success("Member added!");
        setAddMemberOpen(false);
        setMemberForm({ name: "", email: "" });
        fetchSubscription();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add member");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this subscription?`)) return;

    try {
      const res = await fetch(
        `/api/subscriptions/${params.id}/members/${memberId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        toast.success("Member removed");
        fetchSubscription();
      } else {
        toast.error("Failed to remove member");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/subscriptions/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("Subscription updated!");
        setEditOpen(false);
        fetchSubscription();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this subscription? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/subscriptions/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Subscription deleted");
        router.push("/dashboard");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm((prev) => ({ ...prev, qrCodeBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subscription) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            className="mb-2 -ml-3 text-muted-foreground"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">{subscription.name}</h1>
          {subscription.description && (
            <p className="text-muted-foreground mt-1">{subscription.description}</p>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger render={<Button variant="outline" size="sm" />}>
                Edit
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Subscription</DialogTitle>
                  <DialogDescription>
                    Update subscription details
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cost per Member</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.costPerMember}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            costPerMember: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Input
                        value={editForm.currency}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            currency: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Day</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={editForm.billingDay}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          billingDay: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Update QR Code</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileChange}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Members",
            value: subscription.members.length,
            icon: "👥",
          },
          {
            label: "Cost/Member",
            value: `${subscription.currency === "INR" ? "₹" : subscription.currency}${subscription.costPerMember.toFixed(2)}`,
            icon: "💰",
          },
          {
            label: "Billing Day",
            value: `${subscription.billingDay}${["st", "nd", "rd"][((subscription.billingDay % 100) - 20) % 10] || ["st", "nd", "rd"][subscription.billingDay % 100] || "th"}`,
            icon: "📅",
          },
          {
            label: "Total Revenue",
            value: `${subscription.currency === "INR" ? "₹" : subscription.currency}${(subscription.costPerMember * subscription.members.length).toFixed(2)}`,
            icon: "📊",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold mt-0.5">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Members</CardTitle>
              {isOwner && (
                <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                  <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1" />}>
                    <span>+</span> Add Member
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to this subscription
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMember} className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="John Doe"
                          value={memberForm.name}
                          onChange={(e) =>
                            setMemberForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={memberForm.email}
                          onChange={(e) =>
                            setMemberForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setAddMemberOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addingMember}>
                          {addingMember ? "Adding..." : "Add Member"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {subscription.members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-3">👤</div>
                  <p className="text-sm text-muted-foreground">
                    No members yet. Add your first member!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {subscription.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {member.name}
                            {member.userId && (
                              <Badge variant="secondary" className="text-[10px] px-1.5">
                                Registered
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 text-xs"
                          onClick={() => handleRemoveMember(member.id, member.name)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode">
          <Card>
            <CardContent className="p-8 flex flex-col items-center justify-center">
              {subscription.qrCodeUrl ? (
                <>
                  <Image
                    src={subscription.qrCodeUrl}
                    alt="Payment QR Code"
                    width={256}
                    height={256}
                    className="rounded-xl border-2 border-border object-contain bg-white p-2"
                  />
                  <p className="text-sm text-muted-foreground mt-4">
                    This QR code is sent to members on billing day
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📱</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    No QR code uploaded yet
                  </p>
                  {isOwner && (
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                      Upload QR Code
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
