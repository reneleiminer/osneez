import { listSubscribers } from "@/lib/admin/data";
import { canAccess, getAdminSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

/** Route handlers are not covered by the admin layout — guard explicitly. */
export async function GET() {
  const session = await getAdminSession();
  if (!session || !canAccess(session.role, "newsletter")) {
    return new Response("Not found", { status: 404 });
  }

  const subscribers = await listSubscribers();
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const csv = [
    "email,source,active,created_at",
    ...subscribers.map((entry) =>
      [
        escape(entry.email),
        escape(entry.source),
        entry.active ? "true" : "false",
        escape(entry.created_at),
      ].join(","),
    ),
  ].join("\n");

  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="osneez-newsletter.csv"',
      "Cache-Control": "no-store",
    },
  });
}
