import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const supabase = createClient();
  const { data: items, error } = await supabase
    .from("content_items")
    .select("id, title, content_type, platform, stage, publish_date, clients(name)")
    .order("publish_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Content pipeline</h1>
        <p className="mt-1 text-sm text-muted">Every content item, idea through published.</p>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-status-risk">Could not load content items: {error.message}</p>
        </Card>
      ) : !items || items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No content items yet.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Client</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Platform</th>
                <th className="pb-2 pr-4">Publish date</th>
                <th className="pb-2">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4 font-medium text-ink">{item.title}</td>
                  <td className="py-3 pr-4 text-muted">
                    {(item.clients as unknown as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-muted">{item.content_type ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">{item.platform ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">{item.publish_date ?? "—"}</td>
                  <td className="py-3">
                    <Badge tone="brand">{item.stage.replaceAll("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
