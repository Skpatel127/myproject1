"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ApprovalActions({ contentItemId }: { contentItemId: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submitAction(action: "approved" | "rejected" | "revision_requested") {
    setLoading(action);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("approvals").insert({
      content_item_id: contentItemId,
      user_id: user?.id,
      action,
      comment: comment || null,
    });

    setLoading(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return <p className="text-xs text-status-healthy">Response recorded — thank you.</p>;
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment..."
        rows={2}
        className="w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
      />
      {error ? <p className="text-xs text-status-risk">{error}</p> : null}
      <div className="flex gap-2">
        <button
          onClick={() => submitAction("approved")}
          disabled={loading !== null}
          className="rounded-card bg-status-healthy px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-60"
        >
          {loading === "approved" ? "Submitting..." : "Approve"}
        </button>
        <button
          onClick={() => submitAction("revision_requested")}
          disabled={loading !== null}
          className="rounded-card bg-status-attention px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-60"
        >
          {loading === "revision_requested" ? "Submitting..." : "Request revision"}
        </button>
        <button
          onClick={() => submitAction("rejected")}
          disabled={loading !== null}
          className="rounded-card bg-status-risk px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-60"
        >
          {loading === "rejected" ? "Submitting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
