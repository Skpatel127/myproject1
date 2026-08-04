"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";

export default function NewLeadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [expectedValue, setExpectedValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("leads").insert({
      name,
      company: company || null,
      email: email || null,
      source: source || null,
      expected_value: expectedValue ? Number(expectedValue) : null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/leads");
    router.refresh();
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Add lead</h1>
        <p className="mt-1 text-sm text-muted">New leads start in the &ldquo;New&rdquo; stage.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink">
              Contact name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-ink">
              Company
            </label>
            <input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-ink">
                Source
              </label>
              <input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Referral, Website..."
                className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="expectedValue" className="block text-sm font-medium text-ink">
                Expected value ($)
              </label>
              <input
                id="expectedValue"
                type="number"
                min="0"
                value={expectedValue}
                onChange={(e) => setExpectedValue(e.target.value)}
                className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-status-risk">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-card bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save lead"}
          </button>
        </form>
      </Card>
    </div>
  );
}
