import { useMutation, useQuery } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

type Settings = {
  whatsappNumber: string; bankName: string; bankAccountName: string; bankAccountNumber: string; duitNowId: string;
  pendingApprovalHours: number; paymentDeadlineHours: number; depositPercentage: number; fullPaymentRequired: boolean;
  checkInTime: string; checkOutTime: string; cancellationPolicy: string;
  templates: { approved: string; confirmed: string; rejected: string };
};
const empty: Settings = { whatsappNumber: "", bankName: "", bankAccountName: "", bankAccountNumber: "", duitNowId: "", pendingApprovalHours: 2, paymentDeadlineHours: 24, depositPercentage: 100, fullPaymentRequired: true, checkInTime: "15:00", checkOutTime: "11:00", cancellationPolicy: "", templates: { approved: "Reservation approved template configured by the server.", confirmed: "Booking confirmed template configured by the server.", rejected: "Reservation rejected template configured by the server." } };

export function AdminSettingsPage() {
  const query = useQuery({ queryKey: ["reservation-settings"], queryFn: () => api<Settings>("/admin/settings").catch(() => empty) });
  const [value, setValue] = useState(empty);
  useEffect(() => { if (query.data) setValue(query.data); }, [query.data]);
  const save = useMutation({ mutationFn: () => api<Settings>("/admin/settings", { method: "PUT", body: JSON.stringify(value) }), onSuccess: () => toast.success("Reservation settings saved"), onError: (error) => toast.error(error.message) });
  const text = (key: keyof Settings) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue((current) => ({ ...current, [key]: event.target.value }));
  const number = (key: keyof Settings) => (event: React.ChangeEvent<HTMLInputElement>) => setValue((current) => ({ ...current, [key]: Number(event.target.value) }));
  return <><div><h1 className="font-display text-5xl text-primary">Reservation settings</h1><p className="mt-2 text-muted-foreground">Manage WhatsApp, payment instructions, expiry windows and reusable messages.</p></div>
    <form className="mt-8 flex flex-col gap-6" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
      <Card><CardHeader><CardTitle>WhatsApp and bank details</CardTitle></CardHeader><CardContent><FieldGroup className="sm:grid sm:grid-cols-2"><Field><Label>Admin WhatsApp number</Label><Input value={value.whatsappNumber} onChange={text("whatsappNumber")} placeholder="60…" /></Field><Field><Label>Bank name</Label><Input value={value.bankName} onChange={text("bankName")} /></Field><Field><Label>Account name</Label><Input value={value.bankAccountName} onChange={text("bankAccountName")} /></Field><Field><Label>Account number</Label><Input value={value.bankAccountNumber} onChange={text("bankAccountNumber")} /></Field><Field className="sm:col-span-2"><Label>DuitNow ID</Label><Input value={value.duitNowId} onChange={text("duitNowId")} /></Field></FieldGroup></CardContent></Card>
      <Card><CardHeader><CardTitle>Reservation timing and policy</CardTitle></CardHeader><CardContent><FieldGroup className="sm:grid sm:grid-cols-3"><Field><Label>Pending approval (hours)</Label><Input type="number" value={value.pendingApprovalHours} onChange={number("pendingApprovalHours")} /></Field><Field><Label>Payment deadline (hours)</Label><Input type="number" value={value.paymentDeadlineHours} onChange={number("paymentDeadlineHours")} /></Field><Field><Label>Deposit percentage</Label><Input type="number" min="0" max="100" value={value.depositPercentage} onChange={number("depositPercentage")} /></Field><Field><Label>Check-in time</Label><Input type="time" value={value.checkInTime} onChange={text("checkInTime")} /></Field><Field><Label>Check-out time</Label><Input type="time" value={value.checkOutTime} onChange={text("checkOutTime")} /></Field><label className="flex items-center gap-3"><Checkbox checked={value.fullPaymentRequired} onChange={(event) => setValue((current) => ({ ...current, fullPaymentRequired: event.target.checked }))} />Full payment required</label><Field className="sm:col-span-3"><Label>Cancellation policy</Label><Textarea value={value.cancellationPolicy} onChange={text("cancellationPolicy")} /></Field></FieldGroup></CardContent></Card>
      <Card><CardHeader><CardTitle>WhatsApp message templates</CardTitle></CardHeader><CardContent><FieldGroup>{(["approved", "confirmed", "rejected"] as const).map((key) => <Field key={key}><Label className="capitalize">{key} template</Label><Textarea className="min-h-44 font-mono text-xs" value={value.templates[key]} onChange={(event) => setValue((current) => ({ ...current, templates: { ...current.templates, [key]: event.target.value } }))} /></Field>)}</FieldGroup></CardContent></Card>
      <Button className="self-start" type="submit" variant="terracotta" disabled={save.isPending}><Save data-icon="inline-start" />{save.isPending ? "Saving…" : "Save settings"}</Button>
    </form></>;
}
