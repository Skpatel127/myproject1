import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { TaskStatus, TaskPriority } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_COLUMNS: TaskStatus[] = [
  "not_started",
  "assigned",
  "in_progress",
  "waiting_internal_review",
  "waiting_client",
  "revision_required",
  "blocked",
  "completed",
];

const PRIORITY_TONE: Record<TaskPriority, "neutral" | "info" | "attention" | "risk"> = {
  low: "neutral",
  normal: "neutral",
  high: "info",
  urgent: "attention",
  critical: "risk",
};

export default async function TasksPage() {
  const supabase = createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date")
    .order("due_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Tasks</h1>
        <p className="mt-1 text-sm text-muted">Board view by status.</p>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-status-risk">Could not load tasks: {error.message}</p>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((status) => {
            const items = (tasks ?? []).filter((t) => t.status === status);
            return (
              <div key={status} className="w-72 shrink-0">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {status.replaceAll("_", " ")} ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((task) => (
                    <Card key={task.id}>
                      <p className="text-sm font-medium text-ink">{task.title}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted">
                          {task.due_date ?? "No due date"}
                        </span>
                        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                      </div>
                    </Card>
                  ))}
                  {items.length === 0 ? (
                    <p className="text-xs text-muted">Nothing here.</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
