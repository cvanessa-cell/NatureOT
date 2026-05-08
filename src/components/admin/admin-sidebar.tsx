import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  UsersRound,
  Calendar,
  Handshake,
  PenSquare,
  Megaphone,
  LineChart,
  MapPin,
  Star,
  ShieldCheck,
  Database,
  Workflow,
  Bot,
  Settings,
  Mail,
  Rocket,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

const primary: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/waitlist", label: "Waitlist", icon: ListOrdered },
  { href: "/admin/groups", label: "Groups", icon: UsersRound },
  { href: "/admin/workshops", label: "Workshops", icon: Calendar },
  { href: "/admin/referral-partners", label: "Referral Partners", icon: Handshake },
];

const marketing: NavItem[] = [
  { href: "/admin/marketing/dashboard", label: "Marketing Dashboard", icon: Megaphone },
  { href: "/admin/marketing/campaigns", label: "Campaigns", icon: LayoutDashboard },
  { href: "/admin/marketing/partners", label: "Partners", icon: Handshake },
  { href: "/admin/marketing/content", label: "Content Studio", icon: PenSquare },
  { href: "/admin/marketing/automations", label: "Automations", icon: Workflow },
  { href: "/admin/marketing/accountability", label: "Accountability", icon: Rocket },
  { href: "/admin/marketing/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/admin/marketing/metrics", label: "Metrics", icon: LineChart },
];

const growth: NavItem[] = [
  { href: "/admin/content", label: "Content Calendar", icon: PenSquare },
  { href: "/admin/local-seo", label: "Local SEO", icon: MapPin },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/campaign-policy", label: "Campaign policy", icon: ShieldCheck },
];

const integrations: NavItem[] = [
  { href: "/admin/airtable", label: "Airtable Sync", icon: Database },
  { href: "/admin/zapier", label: "Zapier Automations", icon: Workflow },
  { href: "/admin/agent-airtable", label: "Agent_Airtable", icon: Bot },
];

const system: NavItem[] = [
  { href: "/admin/sequences", label: "Email sequences", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/settings/launch-readiness", label: "Launch readiness", icon: Rocket },
];

function NavSection({
  title,
  items,
  activePath,
}: {
  title: string;
  items: NavItem[];
  activePath: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-cream/55">
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            activePath === item.href ||
            (item.href !== "/admin" && activePath.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-cream/15 text-cream"
                    : "text-cream/85 hover:bg-cream/10 hover:text-cream"
                )}
              >
                <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AdminSidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-forest md:flex">
      <div className="border-b border-white/10 px-4 py-4">
        <Link
          href="/admin/marketing/dashboard"
          className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-cream"
        >
          TreeTots Growth Engine
        </Link>
        <p className="mt-1 text-xs text-cream/65">Marketing + ops command center</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Admin">
        <NavSection title="Operations" items={primary} activePath={activePath} />
        <NavSection title="Marketing" items={marketing} activePath={activePath} />
        <NavSection title="Growth" items={growth} activePath={activePath} />
        <NavSection title="Integrations" items={integrations} activePath={activePath} />
        <NavSection title="System" items={system} activePath={activePath} />
      </nav>
      <div className="border-t border-white/10 px-4 py-4 text-xs text-cream/65">
        <Link href="/" className="font-medium text-cream underline-offset-4 hover:underline">
          View public site
        </Link>
      </div>
    </aside>
  );
}
