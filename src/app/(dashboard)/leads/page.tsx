import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { LeadStage } from "@/lib/types";

export const dynamic = "force-dynamic";

const STAGE_ORDER: LeadStage[] = [
  "new",
  "contacted",
  "follow_up_required",
  "meeting_scheduled",
  "requirement_collected",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
  "on_hold",
];

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, company, stage, expected_value, probability, follow_up_date")
    .order("created_at", { ascending: false });

  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    items: (leads ?? []).filter((l) => l.stage === stage),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Leads</h1>
          <p className="mt-1 text-sm text-muted">Sales pipeline, grouped by stage.</p>
        </div>
        <Link
          href="/leads/new"
          className="rounded-card bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          + Add lead
        </Link>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-status-risk">Could not load leads: {error.message}</p>
        </Card>
      ) : grouped.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            No leads yet. Click &ldquo;Add lead&rdquo; to create your first one.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.stage}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {group.stage.replaceAll("_", " ")} ({group.items.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((lead) => (
                  <Card key={lead.id}>
                    <p className="text-sm font-medium text-ink">{lead.name}</p>
                    <p className="text-xs text-muted">{lead.company ?? "—"}</p>
                    <div className="mt-3 flex items-center justify-between">
                      {lead.expected_value ? (
                        <span className="text-sm text-ink">
                          ${Number(lead.expected_value).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted">—</span>
                      )}
                      {lead.probability != null ? (
                        <Badge tone="info">{lead.probability}%</Badge>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
