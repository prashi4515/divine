import {
  BookOpen,
  FileText,
  FolderTree,
  Heart,
  Languages,
  LayoutDashboard,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  description: string;
};

export const adminNav: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and activity",
  },
  {
    title: "Works",
    href: "/admin/works",
    icon: Library,
    description: "Scripture corpora",
  },
  {
    title: "Chapters",
    href: "/admin/chapters",
    icon: FolderTree,
    description: "Chapter structure",
  },
  {
    title: "Verses",
    href: "/admin/verses",
    icon: BookOpen,
    description: "Verse catalog",
  },
  {
    title: "Translations",
    href: "/admin/translations",
    icon: FileText,
    description: "Localized meanings",
  },
  {
    title: "Languages",
    href: "/admin/languages",
    icon: Languages,
    description: "Locale catalog",
  },
  {
    title: "Topics",
    href: "/admin/topics",
    icon: Sparkles,
    description: "Thematic taxonomy",
  },
  {
    title: "Emotions",
    href: "/admin/emotions",
    icon: Heart,
    description: "Emotion tags",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "CMS preferences",
  },
];

export function getAdminBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Admin", href: "/admin" }];
  if (pathname === "/admin") {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }
  const match = adminNav.find((item) => item.href !== "/admin" && pathname.startsWith(item.href));
  if (match) {
    crumbs.push({ label: match.title });
  }
  return crumbs;
}
