import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ApprovalActions } from "@/components/ApprovalActions";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const supabase = createClient();

  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, content_type, platform, stage, publish_date")
    .in("stage", ["client_approval", "client_review", "final_approval", "published"])
    .order("publish_date", { ascending: true });

  const pending = (items ?? []).filter((i) =>
    ["client_approval", "client_review"].includes(i.stage)
  );
  const published = (items ?? []).filter((i) => i.stage === "published");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Your content</h1>
        <p className="mt-1 text-sm text-muted">Review pending items and see what&apos;s live.</p>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-status-risk">Could not load content: {error.message}</p>
        </Card>
      ) : (
        <>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink">Pending your review</h2>
            {pending.length === 0 ? (
              <Card>
                <p className="text-sm text-muted">Nothing needs your attention right now.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pending.map((item) => (
                  <Card key={item.id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">{item.title}</p>
                        <p className="text-xs text-muted">
                          {item.content_type ?? "—"} · {item.platform ?? "—"}
                          {item.publish_date ? ` · publishing ${item.publish_date}` : ""}
                        </p>
                      </div>
                      <Badge tone="brand">{item.stage.replaceAll("_", " ")}</Badge>
                    </div>
                    <ApprovalActions contentItemId={item.id} />
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink">Published</h2>
            {published.length === 0 ? (
              <Card>
                <p className="text-sm text-muted">Nothing published yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {published.map((item) => (
                  <Card key={item.id}>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.platform ?? "—"} · {item.publish_date ?? "—"}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
