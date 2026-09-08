import pg from "pg";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { calculateQuote, type Resource } from "../src/domain";
import { demoCatalog } from "../src/data";
// Run in an explicitly isolated disposable database. This script creates a fresh
// temporary database and drops ONLY that database after completion.
const connectionString =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres@127.0.0.1:55432/postgres";
const admin = new pg.Client({ connectionString });
await admin.connect();
const dbName = `suka_test_${randomUUID().replaceAll("-", "")}`;
await admin.query(`create database ${dbName}`);
const url = new URL(connectionString);
url.pathname = `/${dbName}`;
const client = new pg.Client({ connectionString: url.toString() });
await client.connect();
let passed = 0;
const ok = (label: string) => {
  passed++;
  console.log(`PASS ${label}`);
};
const baseDate = new Date();
baseDate.setUTCDate(
  baseDate.getUTCDate() + 14 + ((5 - baseDate.getUTCDay() + 7) % 7),
);
const date = (day: number) => {
  const d = new Date(baseDate);
  d.setUTCDate(d.getUTCDate() + day - 1);
  return d.toISOString().slice(0, 10);
};
const input = (ids: Resource[], start = 1, end = 3) => ({
  check_in: date(start),
  check_out: date(end),
  resources: ids,
  adults: 2,
  children: 0,
  name: "Test Guest",
  phone: "0123456789",
  email: "test@example.test",
  special_requests: "Test only",
  accepted: true,
  policy_version: "1",
  language: "ms",
  idempotency_key: randomUUID(),
});
const submit = async (p: ReturnType<typeof input>, c = client) =>
  (await c.query("select public.create_booking($1,$2) as b", [p, randomUUID()]))
    .rows[0].b;
const rejects = async (fn: () => Promise<unknown>, match: RegExp) => {
  await assert.rejects(fn, match);
};
try {
  await client.query(
    `do $$ begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if; if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if; if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if; end $$; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated,service_role; grant execute on function auth.uid() to anon,authenticated,service_role;`,
  );
  for (const migration of (await fs.readdir("supabase/migrations"))
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    await client.query(
      await fs.readFile(`supabase/migrations/${migration}`, "utf8"),
    );
  }
  ok("migration applies on real PostgreSQL");
  await client.query(
    `update public.property_settings set booking_enabled=true,whatsapp='60123456789',policies='{"ms":"Polisi ujian sahaja.","en":"Test policies only."}'; update public.accommodation_packages set capacity=case when id='WHOLE' then 20 when id='MAIN' then 12 else 3 end;`,
  );
  const one = await submit(input(["MAIN"]));
  const room = await submit(input(["ROOM_B"]));
  assert.equal(one.status, "pending");
  assert.equal(room.status, "pending");
  ok("Main Homestay and independent roomstay coexist");
  await rejects(
    () => submit(input(["MAIN", "ROOM_A", "ROOM_B", "ROOM_C"])),
    /conflicting key|exclusion/,
  );
  ok("Whole House conflicts with a reserved component");
  const whole = await submit(
    input(["MAIN", "ROOM_A", "ROOM_B", "ROOM_C"], 4, 6),
  );
  assert.equal(whole.quote.package_id, "WHOLE");
  assert.equal(whole.quote.total_sen, 160000);
  await rejects(
    () => submit(input(["ROOM_C"], 4, 5)),
    /conflicting key|exclusion/,
  );
  ok("Whole House reserves every resource and uses package price");
  const addon = await submit(input(["MAIN", "ROOM_C"], 7, 9));
  const allocations = await client.query(
    "select resource_id from public.booking_allocations where booking_id=$1 order by resource_id",
    [addon.id],
  );
  assert.deepEqual(
    allocations.rows.map((r) => r.resource_id),
    ["MAIN", "ROOM_C"],
  );
  assert.equal(addon.quote.total_sen, 114000);
  ok("Add-ons allocate exactly their resources and correct rate");
  await submit(input(["MAIN"], 3, 4));
  ok("Half-open stays permit same-day turnover");
  const duplicate = input(["ROOM_A"], 10, 12);
  const first = await submit(duplicate);
  const second = await submit(duplicate);
  assert.equal(first.id, second.id);
  await rejects(
    () => submit({ ...duplicate, name: "Changed Name" }),
    /IDEMPOTENCY_MISMATCH/,
  );
  ok("Idempotent repeat returns same request; changed payload rejected");
  const c2 = new pg.Client({ connectionString: url.toString() });
  await c2.connect();
  const concurrent = await Promise.allSettled([
    submit(input(["MAIN"], 13, 15)),
    submit(input(["MAIN"], 13, 15), c2),
  ]);
  await c2.end();
  assert.equal(concurrent.filter((r) => r.status === "fulfilled").length, 1);
  ok("Concurrent requests cannot double-book");
  const exp = await submit(
    input(["MAIN", "ROOM_A", "ROOM_B", "ROOM_C"], 16, 18),
  );
  await client.query(
    `update public.bookings set expires_at=now()-interval '1 minute' where id=$1`,
    [exp.id],
  );
  const after = await submit(input(["ROOM_A"], 16, 18));
  assert.equal(
    (
      await client.query("select status from public.bookings where id=$1", [
        exp.id,
      ])
    ).rows[0].status,
    "expired",
  );
  ok("Expired holds released server-side before a new allocation");
  const actor = randomUUID();
  await client.query("insert into auth.users values($1);", [actor]);
  await client.query("insert into public.admin_profiles values($1)", [actor]);
  await rejects(
    () =>
      client.query("select public.admin_action($1,$2)", [
        actor,
        { action: "confirm", id: one.id },
      ]),
    /PAYMENT_REQUIRED/,
  );
  ok("Confirmation requires recorded payment");
  await client.query("select public.admin_action($1,$2)", [
    actor,
    {
      action: "payment",
      id: exp.id,
      amount_sen: exp.total_sen,
      reference: "TEST",
      idempotency_key: randomUUID(),
    },
  ]);
  await rejects(
    () =>
      client.query("select public.admin_action($1,$2)", [
        actor,
        { action: "confirm", id: exp.id },
      ]),
    /conflicting key|exclusion/,
  );
  ok("Expired confirmation cannot bypass a new inventory conflict");
  await client.query("select public.admin_action($1,$2)", [
    actor,
    { action: "cancel", id: after.id },
  ]);
  await client.query("select public.admin_action($1,$2)", [
    actor,
    { action: "confirm", id: exp.id },
  ]);
  ok(
    "Cancelled booking releases inventory, expired confirmation rechecks successfully",
  );
  await client.query("select public.admin_action($1,$2)", [
    actor,
    {
      action: "block",
      resource_id: "ROOM_B",
      check_in: date(19),
      check_out: date(21),
      kind: "maintenance",
      label: "Test maintenance",
    },
  ]);
  await rejects(
    () => submit(input(["ROOM_B"], 19, 20)),
    /conflicting key|exclusion/,
  );
  await submit(input(["ROOM_C"], 19, 20));
  ok("Maintenance blocks only its resource");
  await client.query(
    `insert into public.rate_rules(package_id,start_date,end_date,nightly_sen) values('MAIN',$1,$2,99900)`,
    [date(22), date(23)],
  );
  await client.query(
    "update public.accommodation_packages set weekend_rate=50000 where id='MAIN'",
  );
  const price = await client.query("select public.get_quote($1) as q", [
    input(["MAIN"], 22, 25),
  ]);
  assert.equal(price.rows[0].q.total_sen, 199900);
  ok("Date-specific rates override weekend and base rates");
  const snapshot = structuredClone(demoCatalog);
  const basic = calculateQuote(
    { check_in: date(7), check_out: date(9), resources: ["MAIN", "ROOM_C"] },
    snapshot,
  );
  assert.deepEqual(basic, addon.quote);
  ok("Frontend estimate agrees with authoritative SQL snapshot");
  await client.query("set role anon");
  await rejects(
    () => client.query("select * from public.bookings"),
    /permission denied/,
  );
  await rejects(
    () =>
      client.query("select public.create_booking($1,$2)", [
        input(["ROOM_C"], 24, 25),
        "test",
      ]),
    /permission denied/,
  );
  const publicData = (
    await client.query("select public.get_availability($1,$2) as a", [
      date(1),
      date(25),
    ])
  ).rows[0].a;
  assert(
    publicData.every(
      (a: object) =>
        Object.keys(a).sort().join(",") ===
        "check_in,check_out,expires_at,resource_id,state",
    ),
  );
  await client.query("reset role");
  ok(
    "Public cannot read customers or submit privileged RPC; availability reveals no PII",
  );
  await client.query("set role authenticated");
  assert.equal(
    (await client.query("select * from public.bookings")).rowCount,
    0,
  );
  await rejects(
    () => client.query("update public.bookings set status='confirmed'"),
    /permission denied/,
  );
  assert.equal(
    (
      await client.query(
        "update public.property_settings set address='attacker'",
      )
    ).rowCount,
    0,
  );
  await rejects(
    () =>
      client.query("select public.admin_action($1,$2)", [
        actor,
        { action: "cancel", id: one.id },
      ]),
    /permission denied/,
  );
  await client.query("reset role");
  ok(
    "Non-admin authenticated users cannot read bookings, write settings, or bypass actions",
  );
  const limited = input(["ROOM_C"], 26, 27);
  for (let n = 0; n < 5; n++) {
    const p = { ...limited, idempotency_key: randomUUID() };
    const b = (
      await client.query("select public.create_booking($1,$2) as b", [
        p,
        "same-test-ip",
      ])
    ).rows[0].b;
    await client.query("select public.admin_action($1,$2)", [
      actor,
      { action: "cancel", id: b.id },
    ]);
  }
  await rejects(
    () =>
      client.query("select public.create_booking($1,$2)", [
        { ...limited, idempotency_key: randomUUID() },
        "same-test-ip",
      ]),
    /RATE_LIMITED/,
  );
  ok("Public submission rate limit enforced in transaction");
  const cleanup = await submit(input(["ROOM_C"], 28, 30));
  await client.query(
    `update public.bookings set expires_at=now()-interval '1 minute' where id=$1`,
    [cleanup.id],
  );
  await client.query("select public.expire_booking_holds()");
  assert.equal(
    (
      await client.query(
        "select active from public.booking_allocations where booking_id=$1",
        [cleanup.id],
      )
    ).rows[0].active,
    false,
  );
  ok("Scheduled cleanup function deactivates expired inventory");
  await client.query("set role service_role");
  const serviceBooking = await submit(input(["MAIN"], 28, 30));
  assert.equal(serviceBooking.status, "pending");
  await client.query("reset role");
  ok("Edge Function service_role can execute the production transaction");
  await client.query("select public.admin_action($1,$2)", [
    actor,
    { action: "notes", id: first.id, notes: "Private internal staff note" },
  ]);
  const repeated = await submit(duplicate);
  assert.equal(repeated.notes, undefined);
  assert.equal(repeated.request_fingerprint, undefined);
  ok("Guest retries never reveal internal admin notes");
  await client.query("select set_config('request.jwt.claim.sub',$1,false)", [
    actor,
  ]);
  await client.query("set role authenticated");
  assert((await client.query("select * from public.bookings")).rowCount! > 0);
  await client.query("reset role");
  await client.query("select set_config('request.jwt.claim.sub','',false)");
  ok("Allowlisted authenticated admin can read booking records through RLS");
  const payKey = randomUUID();
  const pay = {
    action: "payment",
    id: serviceBooking.id,
    amount_sen: 10000,
    reference: "TEST-PARTIAL",
    idempotency_key: payKey,
  };
  await client.query("select public.admin_action($1,$2)", [actor, pay]);
  await client.query("select public.admin_action($1,$2)", [actor, pay]);
  assert.equal(
    (
      await client.query("select paid_sen from public.bookings where id=$1", [
        serviceBooking.id,
      ])
    ).rows[0].paid_sen,
    10000,
  );
  await client.query("select public.admin_action($1,$2)", [
    actor,
    { ...pay, action: "refund", idempotency_key: randomUUID() },
  ]);
  assert.equal(
    (
      await client.query(
        "select payment_status from public.bookings where id=$1",
        [serviceBooking.id],
      )
    ).rows[0].payment_status,
    "refunded",
  );
  ok("Payment idempotency and refund balance are separate from booking status");

  const manualInput = {
    ...input(["MAIN", "ROOM_B"], 40, 43),
    status: "pending",
    paid_sen: 0,
    payment_reference: "",
  };
  const manual = async (p: typeof manualInput, c = client) =>
    (
      await c.query("select public.admin_create_booking($1,$2) as b", [
        actor,
        p,
      ])
    ).rows[0].b;
  await client.query("set role anon");
  await rejects(() => manual(manualInput), /permission denied/);
  await rejects(
    () => client.query("update public.availability_revision set revision=0"),
    /permission denied/,
  );
  assert.equal(
    (await client.query("select * from public.availability_revision")).rowCount,
    1,
  );
  await client.query("reset role");
  await rejects(
    () =>
      client.query("select public.admin_create_booking($1,$2)", [
        randomUUID(),
        manualInput,
      ]),
    /FORBIDDEN/,
  );
  ok("Manual booking and revision writes deny guests and non-admins");
  await client.query("set role service_role");
  const m = await manual(manualInput);
  assert.equal((await manual(manualInput)).id, m.id);
  await rejects(
    () => manual({ ...manualInput, name: "Other" }),
    /IDEMPOTENCY_MISMATCH/,
  );
  const projected = (
    await client.query("select public.get_availability($1,$2) as a", [
      date(41),
      date(42),
    ])
  ).rows[0].a;
  assert.equal(projected.length, 2);
  assert(
    projected.every(
      (a: any) =>
        a.state === "pending" &&
        a.expires_at &&
        a.check_in === date(41) &&
        a.check_out === date(42),
    ),
  );
  await rejects(
    () => submit(input(["MAIN", "ROOM_A", "ROOM_B", "ROOM_C"], 41, 42)),
    /conflicting key|exclusion/,
  );
  await submit(input(["ROOM_A"], 41, 42));
  ok(
    "Manual pending add-ons project safe clipped dates and share guest conflicts",
  );
  await rejects(
    () =>
      manual({
        ...manualInput,
        idempotency_key: randomUUID(),
        check_in: date(44),
        check_out: date(45),
        status: "confirmed",
      }),
    /PAYMENT_REQUIRED/,
  );
  assert.equal(
    (
      await client.query(
        "select count(*)::int as n from public.bookings where check_in=$1",
        [date(44)],
      )
    ).rows[0].n,
    0,
  );
  ok("Failed manual confirmation rolls back booking and allocation atomically");
  const q = (
    await client.query("select public.get_quote($1) as q", [
      { ...manualInput, check_in: date(44), check_out: date(46) },
    ])
  ).rows[0].q;
  const confirmed = await manual({
    ...manualInput,
    idempotency_key: randomUUID(),
    check_in: date(44),
    check_out: date(46),
    status: "confirmed",
    paid_sen: q.total_sen,
    payment_reference: "TEST-MANUAL",
  });
  assert.equal(confirmed.payment_status, "paid");
  assert.equal(confirmed.status, "confirmed");
  const confirmedProjection = (
    await client.query("select public.get_availability($1,$2) as a", [
      date(44),
      date(46),
    ])
  ).rows[0].a;
  assert(
    confirmedProjection.every(
      (a: any) => a.state === "unavailable" && a.expires_at === null,
    ),
  );
  await manual({
    ...manualInput,
    idempotency_key: randomUUID(),
    check_in: date(46),
    check_out: date(47),
  });
  ok(
    "Manual paid confirmation appears unavailable and same-day turnover remains valid",
  );
  const r0 = (
    await client.query("select revision from public.availability_revision")
  ).rows[0].revision;
  await client.query("select public.admin_action($1,$2)", [
    actor,
    { action: "cancel", id: m.id },
  ]);
  const released = (
    await client.query("select public.get_availability($1,$2) as a", [
      date(40),
      date(41),
    ])
  ).rows[0].a;
  assert.equal(released.length, 0);
  assert(
    BigInt(
      (await client.query("select revision from public.availability_revision"))
        .rows[0].revision,
    ) > BigInt(r0),
  );
  await client.query("reset role");
  await client.query(
    "update public.bookings set expires_at=now()-interval '1 second' where status='pending' and check_in=$1",
    [date(46)],
  );
  assert.equal(
    (
      await client.query("select public.get_availability($1,$2) as a", [
        date(46),
        date(47),
      ])
    ).rows[0].a.length,
    0,
  );
  ok(
    "Cancellation signals Realtime revision; expired holds disappear without waiting for cron",
  );
  console.log(`\n${passed} database integration scenarios passed.`);
} finally {
  await client.end();
  await admin.query(`drop database ${dbName} with (force)`);
  await admin.end();
}
