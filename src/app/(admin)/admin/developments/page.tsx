"use client";

import { ArrowDown, ArrowUp, ImageOff, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { DevelopmentForm } from "@/features/developments/components/DevelopmentForm";
import { useDevelopmentActions, useDevelopments } from "@/features/developments/hooks/useDevelopments";
import { DEVELOPMENT_STATUS_LABELS, type Development } from "@/features/developments/types";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { useCurrentSite } from "@/features/sites/hooks/useSites";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

function Thumb({ development }: { development: Development }) {
  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
      {development.featured_image
        ? <Image src={development.featured_image} alt="" fill sizes="56px" className="object-cover" />
        : <ImageOff className="m-4 size-5 text-muted-foreground" aria-hidden />}
    </div>
  );
}

const Badge = ({ children, tone }: { children: React.ReactNode; tone: "live" | "muted" | "gold" }) => (
  <span className={cn("rounded-full px-2.5 py-0.5 text-xs",
    tone === "live" ? "bg-success/15 text-success" : tone === "gold" ? "text-gold" : "bg-surface-muted text-muted-foreground")}>{children}</span>
);

function NewDevelopmentSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { create } = useDevelopmentActions();
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New development"
      description="Start with the basics. You'll add photos and the button link next. It's hidden from the website until you show it.">
      {open && (
        <DevelopmentForm full={false} pending={create.isPending} submitLabel="Add development"
          onSubmit={(input) => create.mutate({ ...input, is_published: false },
            { onSuccess: (d) => { onOpenChange(false); router.push(`/admin/developments/${d.id}`); } })} />
      )}
    </Sheet>
  );
}

/** Developments belong on the landing page; on another website this screen explains how to get there. */
function NotOnLandingPage() {
  const { sites, select } = useCurrentSite();
  const landing = sites.find((s) => s.kind === "landing");
  return (
    <EmptyState title="Developments are shown on the landing page"
      body={landing ? `Switch to ${landing.name} to manage them.` : "No landing page website has been set up yet."}
      action={landing && <Button variant="outline" onClick={() => select(landing.website_id)}>Switch to {landing.name}</Button>} />
  );
}

function DevelopmentsScreen() {
  const list = useListState();
  const { site } = useCurrentSite();
  const query = useDevelopments();
  const { reorder } = useDevelopmentActions();
  const rows = query.data ?? [];

  if (site && site.kind !== "landing") return <NotOnLandingPage />;

  const move = (i: number, by: -1 | 1) => {
    const ids = rows.map((d) => d.id);
    [ids[i], ids[i + by]] = [ids[i + by], ids[i]];
    reorder.mutate(ids);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Developments" tip={getTooltip("developments.overview")} description="The development cards on the landing page, in the order shown."
        actions={<Button onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> New development</Button>} />
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {(query.isLoading || !site) && !query.error && <SkeletonRows />}
      {query.data && rows.length === 0 && <EmptyState title="No developments yet" body="Add one, give it a featured image, then show it on the website." />}
      {rows.length > 0 && (
        <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {rows.map((d, i) => (
            <li key={d.id} className="flex items-center gap-3 p-3 hover:bg-surface-muted/50">
              <div className="flex flex-col">
                <button type="button" aria-label={`Move ${d.name} up`} disabled={i === 0 || reorder.isPending} onClick={() => move(i, -1)}
                  className="rounded p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="size-4" /></button>
                <button type="button" aria-label={`Move ${d.name} down`} disabled={i === rows.length - 1 || reorder.isPending} onClick={() => move(i, 1)}
                  className="rounded p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="size-4" /></button>
              </div>
              <Link href={`/admin/developments/${d.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <Thumb development={d} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{[d.location, DEVELOPMENT_STATUS_LABELS[d.status]].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {d.featured && <Badge tone="gold">Featured</Badge>}
                  {d.is_coming_soon && <Badge tone="muted">Coming soon</Badge>}
                  <Badge tone={d.is_published ? "live" : "muted"}>{d.is_published ? "Shown" : "Hidden"}</Badge>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <NewDevelopmentSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null })} />
    </div>
  );
}

export default function AdminDevelopmentsPage() {
  return <Suspense><DevelopmentsScreen /></Suspense>;
}
