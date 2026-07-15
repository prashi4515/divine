import {
  BarChart3,
  ClipboardCheck,
  Images,
  Languages,
  LayoutDashboard,
  Library,
  ScrollText,
  Send,
  Settings,
  Tags,
  FileText,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/rbac";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** Permission required to see this destination. */
  permission: Permission;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/**
 * Grouped, permission-aware admin navigation. Groups scale better than a flat
 * list as the console grows. Each item declares the permission needed to view
 * it; the sidebar filters by the current session's capabilities.
 */
export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Platform overview and activity",
        permission: "dashboard:view",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        title: "Library",
        href: "/admin/library",
        icon: Library,
        description: "Every scripture in the platform",
        permission: "library:read",
      },
      {
        title: "Translations",
        href: "/admin/translations",
        icon: FileText,
        description: "Language × source meanings",
        permission: "translation:read",
      },
      {
        title: "Languages",
        href: "/admin/languages",
        icon: Languages,
        description: "Locale catalog (BCP-47)",
        permission: "language:read",
      },
      {
        title: "Topics",
        href: "/admin/topics",
        icon: Tags,
        description: "Hierarchical taxonomy",
        permission: "topic:read",
      },
      {
        title: "Media",
        href: "/admin/media",
        icon: Images,
        description: "Images, audio, video, PDF",
        permission: "media:read",
      },
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    items: [
      {
        title: "Reviews",
        href: "/admin/reviews",
        icon: ClipboardCheck,
        description: "Reviewer queue",
        permission: "review:read",
      },
      {
        title: "Publishing",
        href: "/admin/publishing",
        icon: Send,
        description: "Draft → review → published",
        permission: "publishing:read",
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        description: "Readers, trends, popularity",
        permission: "analytics:read",
      },
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ScrollText,
        description: "Who did what, when",
        permission: "audit:read",
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        description: "People, roles, access",
        permission: "user:read",
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "Platform configuration",
        permission: "settings:read",
      },
    ],
  },
];

/** Flat list for breadcrumbs, search, and active-route matching. */
export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((group) => group.items);

export type Crumb = { label: string; href?: string };

export function getAdminBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Admin", href: "/admin" }];
  if (pathname === "/admin") {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }
  const match = adminNavItems.find(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href),
  );
  if (match) {
    crumbs.push({ label: match.title, href: match.href });
    // A deeper segment (e.g. a scripture detail) becomes a trailing crumb.
    const rest = pathname.slice(match.href.length).split("/").filter(Boolean);
    if (rest.length > 0) crumbs.push({ label: "Details" });
  }
  return crumbs;
}
