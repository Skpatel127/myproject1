import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [
    { count: leadCount },
    { count: clientCount },
    { count: openTaskCount },
    { count: atRiskClientCount },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("is_archived", false),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(completed,cancelled)"),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .in("health", ["at_risk", "critical"]),
    supabase
      .from("leads")
      .select("id, name, company, stage, expected_value")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s happening across the agency.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open leads" value={leadCount ?? 0} />
        <StatCard label="Active clients" value={clientCount ?? 0} />
        <StatCard label="Open tasks" value={openTaskCount ?? 0} />
        <StatCard label="Clients at risk" value={atRiskClientCount ?? 0} />
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-ink">Recent leads</h2>
        <div className="mt-4 divide-y divide-line">
          {recentLeads && recentLeads.length > 0 ? (
            recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{lead.name}</p>
                  <p className="text-xs text-muted">{lead.company ?? "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  {lead.expected_value ? (
                    <span className="text-sm text-muted">
                      ${Number(lead.expected_value).toLocaleString()}
                    </span>
                  ) : null}
                  <Badge tone="brand">{lead.stage.replaceAll("_", " ")}</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="py-3 text-sm text-muted">No leads yet — add your first one from the Leads page.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
