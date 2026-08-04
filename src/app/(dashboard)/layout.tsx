import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import type { UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

type NavItem = { href: string; label: string; roles: UserRole[] };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["owner", "management", "employee"] },
  { href: "/leads", label: "Leads", roles: ["owner", "management", "employee"] },
  { href: "/clients", label: "Clients", roles: ["owner", "management", "employee"] },
  { href: "/tasks", label: "Tasks", roles: ["owner", "management", "employee"] },
  { href: "/content", label: "Content", roles: ["owner", "management", "employee"] },
  { href: "/portal", label: "My Portal", roles: ["client"] },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role: UserRole = profile?.role ?? "employee";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-sm font-semibold text-ink">Agency OS</p>
          <p className="text-xs text-muted">CRM &amp; Production</p>
        </div>

        <nav className="flex-1 space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-card px-3 py-2 text-sm text-ink transition hover:bg-brand-light hover:text-brand-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-line pt-4">
          <p className="truncate px-2 text-sm font-medium text-ink">
            {profile?.full_name ?? user.email}
          </p>
          <p className="px-2 text-xs capitalize text-muted">{role}</p>
          <div className="mt-3 px-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
