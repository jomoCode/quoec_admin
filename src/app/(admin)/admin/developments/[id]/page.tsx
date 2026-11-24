"use client";

import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, use, useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DevelopmentForm } from "@/features/developments/components/DevelopmentForm";
import { DevelopmentImages } from "@/features/developments/components/DevelopmentImages";
import { useDevelopment, useDevelopmentActions } from "@/features/developments/hooks/useDevelopments";
import type { Development } from "@/features/developments/types";

function Switch({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 text-sm">
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" aria-label={label} className="size-5 shrink-0 accent-gold" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function Visibility({ development }: { development: Development }) {
  const { update } = useDevelopmentActions(development.id);
  const ready = Boolean(development.featured_image);
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface">
      <Switch label="Show on the website" checked={development.is_published} disabled={update.isPending || (!ready && !development.is_published)}
        hint={!ready && !development.is_published ? "Add a featured image first." : undefined} onChange={(v) => update.mutate({ is_published: v })} />
      <Switch label="Featured" hint="Highlighted on the landing page." checked={development.featured} disabled={update.isPending} onChange={(v) => update.mutate({ featured: v })} />
    </div>
  );
}

function DeleteDevelopment({ development }: { development: Development }) {
  const router = useRouter();
  const { remove } = useDevelopmentActions(development.id);
  const [open, setOpen] = useState(false);
  return (
    <section className="max-w-3xl space-y-3 rounded-lg border border-danger/40 p-4">
      <div>
        <h2 className="font-display text-xl">Delete this development</h2>
        <p className="mt-1 text-sm text-muted-foreground">Removes its card from the landing page for good. To take it off the website but keep it, switch off “Show on the website” instead.</p>
      </div>
      <Button variant="outline" className="border-danger/60 text-danger hover:bg-danger/10" onClick={() => setOpen(true)}><Trash2 className="size-4" /> Delete development</Button>
      <ConfirmDialog open={open} onOpenChange={setOpen} tone="danger" title={`Delete “${development.name}”?`} confirmLabel="Delete development" pending={remove.isPending}
        body="This can't be undone."
        onConfirm={() => remove.mutate(undefined, { onSuccess: () => { setOpen(false); router.push("/admin/developments"); } })} />
    </section>
  );
}

function Editor({ id }: { id: string }) {
  const query = useDevelopment(id);
  const { update } = useDevelopmentActions(id);
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <SkeletonRows rows={4} />;
  const d = query.data;
  return (
    <div className="space-y-8">
      <Link href="/admin/developments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Developments</Link>
      <PageHeader title={d.name} description={d.location || undefined}
        actions={d.external_url ? <a href={d.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm hover:text-gold"><ExternalLink className="size-4" /> Open button link</a> : undefined} />
      <Visibility development={d} />
      <DevelopmentImages development={d} />
      <section className="max-w-3xl space-y-4">
        <h2 className="font-display text-2xl">Details</h2>
        <DevelopmentForm key={d.id} development={d} full pending={update.isPending} submitLabel="Save changes" onSubmit={(input) => update.mutate(input)} />
      </section>
      <DeleteDevelopment development={d} />
    </div>
  );
}

export default function DevelopmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Editor id={id} /></Suspense>;
}
