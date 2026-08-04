import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ClientHealth } from "@/lib/types";

export const dynamic = "force-dynamic";

const HEALTH_TONE: Record<ClientHealth, "healthy" | "attention" | "risk"> = {
  healthy: "healthy",
  attention: "attention",
  at_risk: "risk",
  critical: "risk",
};

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, industry, health, monthly_deliverables")
    .eq("is_archived", false)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Clients</h1>
        <p className="mt-1 text-sm text-muted">Active accounts and their health status.</p>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-status-risk">Could not load clients: {error.message}</p>
        </Card>
      ) : !clients || clients.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No clients yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="h-full transition hover:border-brand">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{client.name}</p>
                    <p className="text-xs text-muted">{client.industry ?? "—"}</p>
                  </div>
                  <Badge tone={HEALTH_TONE[client.health as ClientHealth]}>
                    {client.health.replaceAll("_", " ")}
                  </Badge>
                </div>
                <p className="mt-4 text-xs text-muted">
                  {client.monthly_deliverables ?? 0} deliverables / month
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
