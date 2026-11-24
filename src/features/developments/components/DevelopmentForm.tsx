"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { getTooltip } from "@/lib/tooltips/registry";
import { DEVELOPMENT_STATUS_LABELS, type Development, type DevelopmentInput, type DevelopmentStatus } from "../types";

type Draft = {
  name: string;
  location: string;
  status: DevelopmentStatus;
  description: string;
  residence_summary: string;
  external_url: string;
  featured_video: string;
  is_coming_soon: boolean;
};

const draftFrom = (d?: Development): Draft => ({
  name: d?.name ?? "",
  location: d?.location ?? "",
  status: d?.status ?? "upcoming",
  description: d?.description ?? "",
  residence_summary: d?.residence_summary ?? "",
  external_url: d?.external_url ?? "",
  featured_video: d?.featured_video ?? "",
  is_coming_soon: d?.is_coming_soon ?? false,
});

const isWebAddress = (v: string) => /^https?:\/\/\S+$/.test(v);
const WEB_ADDRESS_ERROR = "Use a full web address starting with https://, or leave it empty.";

function validate(d: Draft): Partial<Record<keyof Draft, string>> {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (d.name.trim().length < 2) errors.name = "Give the development a name (at least 2 characters).";
  if (d.external_url.trim() && !isWebAddress(d.external_url.trim())) errors.external_url = WEB_ADDRESS_ERROR;
  if (d.featured_video.trim() && !isWebAddress(d.featured_video.trim())) errors.featured_video = WEB_ADDRESS_ERROR;
  return errors;
}

/** Name, place, stage and write-up of a development card. `full` adds the optional extras (used on the edit page). */
export function DevelopmentForm({ development, full, pending, submitLabel, onSubmit }: {
  development?: Development;
  full: boolean;
  pending: boolean;
  submitLabel: string;
  onSubmit: (input: DevelopmentInput & { name: string }) => void;
}) {
  const [d, setD] = useState<Draft>(() => draftFrom(development));
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const set = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(d);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit({
      name: d.name.trim(),
      location: d.location.trim(),
      status: d.status,
      description: d.description.trim(),
      ...(full && {
        residence_summary: d.residence_summary.trim() || null,
        external_url: d.external_url.trim(),
        featured_video: d.featured_video.trim() || null,
        is_coming_soon: d.is_coming_soon,
      }),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormField id="dev-name" label="Name" error={errors.name}>
        <input id="dev-name" value={d.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} aria-invalid={Boolean(errors.name)} className={inputClass} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="dev-location" label="Location">
          <input id="dev-location" value={d.location} maxLength={120} placeholder="e.g. Asokoro, Abuja" onChange={(e) => set({ location: e.target.value })} className={inputClass} />
        </FormField>
        <FormField id="dev-status" label="Stage">
          <select id="dev-status" value={d.status} onChange={(e) => set({ status: e.target.value as DevelopmentStatus })} className={inputClass}>
            {Object.entries(DEVELOPMENT_STATUS_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </FormField>
      </div>
      <FormField id="dev-description" label="Description">
        <textarea id="dev-description" rows={4} maxLength={2000} value={d.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} />
      </FormField>
      {full && (
        <>
          <FormField id="dev-residences" label="Residences">
            <input id="dev-residences" value={d.residence_summary} maxLength={200} placeholder="e.g. 12 four-bedroom terraces"
              onChange={(e) => set({ residence_summary: e.target.value })} className={inputClass} />
          </FormField>
          <FormField id="dev-link" label="Button link" tip={getTooltip("developments.link")} error={errors.external_url}>
            <input id="dev-link" type="url" value={d.external_url} maxLength={600} placeholder="https://" onChange={(e) => set({ external_url: e.target.value })}
              aria-invalid={Boolean(errors.external_url)} className={inputClass} />
          </FormField>
          <FormField id="dev-video" label="Video link" error={errors.featured_video}>
            <input id="dev-video" type="url" value={d.featured_video} maxLength={600} placeholder="https://" onChange={(e) => set({ featured_video: e.target.value })}
              aria-invalid={Boolean(errors.featured_video)} className={inputClass} />
          </FormField>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-gold" checked={d.is_coming_soon} onChange={(e) => set({ is_coming_soon: e.target.checked })} />
            <span>
              Show as “Coming soon”
              <span className="block text-xs text-muted-foreground">{getTooltip("developments.comingSoon")}</span>
            </span>
          </label>
        </>
      )}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
