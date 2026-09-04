import {
  BedDouble,
  CalendarCheck,
  Download,
  Plus,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money } from "@/lib/utils";
const revenue = [
  8, 13, 11, 22, 25, 34, 41, 45, 42, 53, 68, 66, 49, 39, 31, 29, 40, 37, 52, 70,
].map((revenue, i) => ({ day: i + 1, revenue: revenue * 1000 }));
const trend = [8, 13, 9, 11, 14, 10, 16, 12, 18, 21, 17, 23].map(
  (value, i) => ({
    week: i + 1,
    confirmed: value,
    pending: Math.max(2, Math.round(value * 0.2)),
  }),
);
const stays = [
  ["Aiman Zulkifli", "Alam Villa Langkawi", "5 Sep 2026", 165000, "Confirmed"],
  [
    "Siti Nurhaliza",
    "Damai Hillside Home",
    "6 Sep 2026",
    98000,
    "Awaiting payment",
  ],
  ["Jason Cheng", "Rimba Retreat Janda Baik", "7 Sep 2026", 72000, "Confirmed"],
  ["Muhammad Faiz", "Alam Villa Langkawi", "8 Sep 2026", 220000, "Confirmed"],
];
export function AdminDashboardPage() {
  return (
    <>
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="font-display text-5xl text-primary">
            Good morning, Nadia
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here’s what’s happening across your stays.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <CalendarCheck />
            Sep 2026
          </Button>
          <Button variant="outline">
            <Download />
            Export report
          </Button>
          <Button variant="terracotta">
            <Plus />
            New booking
          </Button>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            [WalletCards, "Revenue this month", "RM 128,340"],
            [TrendingUp, "Occupancy rate", "72%"],
            [CalendarCheck, "Confirmed bookings", "86"],
            [BedDouble, "Upcoming check-ins", "24"],
          ] as Array<[LucideIcon, string, string]>
        ).map(([Icon, label, value]) => (
          <Card key={label as string}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">
                  {label as string}
                </p>
                <p className="font-display text-3xl text-primary">
                  {value as string}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Revenue overview</CardTitle>
            <strong className="font-display text-2xl">RM 128,340</strong>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#18392b" stopOpacity={0.18} />
                    <stop offset="1" stopColor="#18392b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => money(Number(v) * 100)} />
                <Area
                  isAnimationActive={false}
                  dataKey="revenue"
                  stroke="#18392b"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar
                  isAnimationActive={false}
                  dataKey="confirmed"
                  stackId="a"
                  fill="#18392b"
                  radius={[0, 0, 2, 2]}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="pending"
                  stackId="a"
                  fill="#c45f3d"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming stays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    {["Guest", "Stay", "Check-in", "Amount", "Status"].map(
                      (h) => (
                        <th className="pb-3 font-medium" key={h}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stays.map((s) => (
                    <tr key={s[0] as string}>
                      {s.slice(0, 4).map((v, i) => (
                        <td className="py-3 pr-4" key={i}>
                          {i === 3 ? money(v as number) : (v as string)}
                        </td>
                      ))}
                      <td>
                        <Badge
                          className={
                            s[4] === "Awaiting payment"
                              ? "bg-[#f5dfd5] text-accent"
                              : ""
                          }
                        >
                          {s[4] as string}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Properties needing attention</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              ["Alam Villa Langkawi", "A/C issue in Villa 2"],
              ["Damai Hillside Home", "1 booking pending"],
              ["Rimba Retreat Janda Baik", "Water heater check"],
            ].map(([p, n]) => (
              <div
                className="flex items-center justify-between border-b pb-4 last:border-0"
                key={p}
              >
                <div>
                  <p className="font-semibold">{p}</p>
                  <p className="text-xs text-muted-foreground">{n}</p>
                </div>
                <Badge>Review</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
