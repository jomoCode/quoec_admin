import {
  BarChart3,
  ChartLine,
  BookOpen,
  FileText,
  Globe,
  Building2,
  CreditCard,
  Home,
  Inbox,
  KeyRound,
  LayoutGrid,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  ReceiptText,
  ScrollText,
  Settings2,
  ShieldCheck,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Perm } from "@/features/auth/permissions";
import type { SiteKind } from "@/features/sites/types";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown if the user holds any of these. Empty = everyone in the admin area. */
  anyOf: string[];
  /** Pinned to the phone bottom bar. */
  primary?: boolean;
  /** Visual group in the sidebar. */
  group: "Estate" | "Money" | "Website" | "System";
  /** Only for these kinds of website (the one picked in the sidebar). Empty/absent = any. */
  siteKinds?: SiteKind[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, anyOf: [], primary: true, group: "Estate" },
  { label: "Estates", href: "/admin/estates", icon: Building2, anyOf: [Perm.EstatesView], group: "Estate" },
  { label: "Houses", href: "/admin/houses", icon: Home, anyOf: [Perm.HousesView], primary: true, group: "Estate" },
  { label: "Residents", href: "/admin/residents", icon: Users, anyOf: [Perm.ResidentsView], primary: true, group: "Estate" },
  { label: "Support", href: "/admin/support", icon: LifeBuoy, anyOf: [Perm.TicketsView], group: "Estate" },
  { label: "Notices", href: "/admin/notices", icon: Megaphone, anyOf: [Perm.NoticesManage], group: "Estate" },
  { label: "Visitors", href: "/admin/visitors", icon: ShieldCheck, anyOf: [Perm.VisitorsView], group: "Estate" },
  { label: "Bills", href: "/admin/bills", icon: ReceiptText, anyOf: [Perm.BillsView], primary: true, group: "Money" },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, anyOf: [Perm.PaymentsView], group: "Money" },
  { label: "Finance", href: "/admin/finance", icon: BarChart3, anyOf: [Perm.ReportsView], group: "Money" },
  { label: "Billing setup", href: "/admin/billing-setup", icon: Settings2, anyOf: [Perm.PaymentHeadsManage, Perm.BillsIssue, Perm.SettingsManage], group: "Money" },
  { label: "Developments", href: "/admin/developments", icon: LayoutGrid, anyOf: [Perm.CmsManage], group: "Website", siteKinds: ["landing"] },
  { label: "Listings", href: "/admin/properties", icon: Store, anyOf: [Perm.CmsManage], group: "Website", siteKinds: ["estate"] },
  { label: "Enquiries", href: "/admin/enquiries", icon: Inbox, anyOf: [Perm.LeadsView], group: "Website" },
  { label: "Journal", href: "/admin/journal", icon: FileText, anyOf: [Perm.CmsManage], group: "Website" },
  { label: "Site content", href: "/admin/site", icon: Globe, anyOf: [Perm.CmsManage], group: "Website" },
  { label: "Insights", href: "/admin/insights", icon: ChartLine, anyOf: [Perm.AnalyticsView], group: "Website" },
  { label: "Team & roles", href: "/admin/access", icon: KeyRound, anyOf: [Perm.RolesManage], group: "System" },
  { label: "Activity log", href: "/admin/activity", icon: ScrollText, anyOf: [Perm.AuditView], group: "System" },
  { label: "User manual", href: "/admin/manual", icon: BookOpen, anyOf: [], group: "System" },
];

/** `siteKind` = kind of the website picked in the sidebar (undefined while loading: site-specific items wait). */
export function visibleNav(can: (p: string) => boolean, siteKind?: SiteKind): AdminNavItem[] {
  return ADMIN_NAV.filter(
    (item) => (item.anyOf.length === 0 || item.anyOf.some(can)) && (!item.siteKinds?.length || (siteKind !== undefined && item.siteKinds.includes(siteKind))),
  );
}

export function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
