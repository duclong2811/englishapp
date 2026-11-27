import { buildBank, toTestLevel } from "@/lib/tests/build-bank";

/**
 * The question bank of one level, as JSON. Fetched by the test pages so the
 * pages themselves stay small; the browser keeps it for an hour.
 */
export async function GET(_: Request, { params }: RouteContext<"/api/tests/[level]">) {
  const level = toTestLevel((await params).level);
  if (!level) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(await buildBank(level), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
