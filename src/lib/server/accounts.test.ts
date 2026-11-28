import { DatabaseSync } from "node:sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SqlDb, SqlStatement } from "./db";

vi.mock("server-only", () => ({}));

// A cookie jar standing in for next/headers.
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
}));

/** D1's API over an in-memory SQLite database. */
function sqliteDb(): SqlDb {
  const db = new DatabaseSync(":memory:");
  const statement = (sql: string, values: unknown[] = []): SqlStatement => ({
    bind: (...v) => statement(sql, v),
    first: async <T,>() => (db.prepare(sql).get(...(values as never[])) as T | undefined) ?? null,
    all: async <T,>() => ({ results: db.prepare(sql).all(...(values as never[])) as T[] }),
    run: async () => db.prepare(sql).run(...(values as never[])),
  });
  return { prepare: (sql) => statement(sql) };
}

const { setDbForTests } = await import("./db");
const { aiGate } = await import("./quota");
const { getViewer } = await import("./auth");
const register = await import("@/app/api/auth/register/route");
const login = await import("@/app/api/auth/login/route");
const logout = await import("@/app/api/auth/logout/route");
const progress = await import("@/app/api/progress/route");
const adminUsers = await import("@/app/api/admin/users/[id]/route");

const post = (body: unknown) =>
  new Request("http://x/api", { method: "POST", body: JSON.stringify(body), headers: { "cf-connecting-ip": "1.2.3.4" } });

beforeEach(() => {
  jar.clear();
  setDbForTests(sqliteDb());
  vi.stubEnv("ADMIN_EMAILS", "boss@example.com");
});

describe("accounts", () => {
  it("leaves AI open when no database is bound", async () => {
    setDbForTests(null);
    expect((await getViewer()).kind).toBe("open");
    expect((await aiGate("write-check", "B1")).ok).toBe(true);
  });

  it("registers, signs out and signs in", async () => {
    const res = await register.POST(post({ email: " Lan@Example.com ", password: "password1", name: "Lan" }));
    expect(res.status).toBe(201);
    expect((await getViewer()).kind).toBe("member");
    await logout.POST(post({}));
    expect((await getViewer()).kind).toBe("guest");
    expect((await login.POST(post({ email: "lan@example.com", password: "wrong-pass" }))).status).toBe(401);
    expect((await login.POST(post({ email: "lan@example.com", password: "password1" }))).status).toBe(200);
    expect((await getViewer()).kind).toBe("member");
    expect((await register.POST(post({ email: "lan@example.com", password: "password1" }))).status).toBe(409);
  });

  it("rejects short passwords and limits failed sign-ins", async () => {
    expect((await register.POST(post({ email: "a@b.co", password: "short" }))).status).toBe(400);
    await register.POST(post({ email: "a@b.co", password: "password1" }));
    for (let i = 0; i < 10; i++) await login.POST(post({ email: "a@b.co", password: "nope-nope" }));
    expect((await login.POST(post({ email: "a@b.co", password: "password1" }))).status).toBe(429);
  });

  it("turns AI off for guests, limits members and not admins", async () => {
    let gate = await aiGate("write-check", "B2");
    expect(gate.ok ? 0 : gate.status).toBe(401);

    await register.POST(post({ email: "m@example.com", password: "password1" }));
    for (let i = 0; i < 2; i++) {
      gate = await aiGate("write-check", "B2");
      expect(gate.ok).toBe(true);
      if (gate.ok) await gate.consume();
    }
    gate = await aiGate("write-check", "B2");
    expect(gate.ok ? 0 : gate.status).toBe(429);
    expect((await aiGate("write-check", "B1")).ok).toBe(true);

    jar.clear();
    await register.POST(post({ email: "boss@example.com", password: "password1" }));
    expect((await getViewer()).kind).toBe("admin");
    for (let i = 0; i < 5; i++) {
      gate = await aiGate("write-check", "B2");
      expect(gate.ok).toBe(true);
      if (gate.ok) await gate.consume();
    }
  });

  it("merges progress from two devices", async () => {
    await register.POST(post({ email: "p@example.com", password: "password1" }));
    const a = await progress.POST(post({ values: { "grammar:a1:v1": JSON.stringify({ x: { best: 90, at: "1" } }) } }));
    expect(a.status).toBe(200);
    const b = await (await progress.POST(post({ values: { "grammar:a1:v1": JSON.stringify({ y: { best: 50, at: "2" } }) } }))).json();
    expect(Object.keys(JSON.parse(b.values["grammar:a1:v1"])).sort()).toEqual(["x", "y"]);
  });

  it("lets admins lock users, which signs them out", async () => {
    await register.POST(post({ email: "u@example.com", password: "password1" }));
    const userCookie = new Map(jar);
    jar.clear();
    await register.POST(post({ email: "boss@example.com", password: "password1" }));
    const params = { params: Promise.resolve({ id: "1" }) };
    const res = await adminUsers.PATCH(
      new Request("http://x", { method: "PATCH", body: JSON.stringify({ status: "locked" }) }),
      params as never,
    );
    expect(res.status).toBe(200);
    jar.clear();
    userCookie.forEach((v, k) => jar.set(k, v));
    expect((await getViewer()).kind).toBe("guest");
    expect((await login.POST(post({ email: "u@example.com", password: "password1" }))).status).toBe(403);
  });
});
