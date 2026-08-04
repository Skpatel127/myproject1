import { notFound } from "next/navigation";
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

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: client }, { data: contentItems }, { data: tasks }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", params.id).single(),
    supabase
      .from("content_items")
      .select("id, title, content_type, platform, stage, publish_date")
      .eq("client_id", params.id)
      .order("publish_date", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date")
      .eq("client_id", params.id)
      .not("status", "in", "(completed,cancelled)")
      .order("due_date", { ascending: true }),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{client.name}</h1>
          <p className="mt-1 text-sm text-muted">{client.industry ?? "—"}</p>
        </div>
        <Badge tone={HEALTH_TONE[client.health as ClientHealth]}>
          {client.health.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Content in production</h2>
          <div className="mt-4 divide-y divide-line">
            {contentItems && contentItems.length > 0 ? (
              contentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.content_type ?? "—"} · {item.platform ?? "—"}
                    </p>
                  </div>
                  <Badge tone="brand">{item.stage.replaceAll("_", " ")}</Badge>
                </div>
              ))
            ) : (
              <p className="py-3 text-sm text-muted">No content items yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Open tasks</h2>
          <div className="mt-4 divide-y divide-line">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{task.title}</p>
                    <p className="text-xs text-muted">
                      {task.due_date ? `Due ${task.due_date}` : "No due date"}
                    </p>
                  </div>
                  <Badge tone="info">{task.status.replaceAll("_", " ")}</Badge>
                </div>
              ))
            ) : (
              <p className="py-3 text-sm text-muted">No open tasks.</p>
            )}
          </div>
        </Card>
      </div>

      {client.notes ? (
        <Card>
          <h2 className="text-sm font-semibold text-ink">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{client.notes}</p>
        </Card>
      ) : null}
    </div>
  );
}
