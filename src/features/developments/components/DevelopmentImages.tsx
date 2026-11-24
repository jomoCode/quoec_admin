"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { useDevelopmentActions } from "../hooks/useDevelopments";
import type { Development, ImageSlot } from "../types";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_GALLERY = 40; // same limit as the backend

/** Featured image (one) and gallery (ordered list) of a development card. */
export function DevelopmentImages({ development }: { development: Development }) {
  const actions = useDevelopmentActions(development.id);
  const featuredInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const gallery = development.gallery_images;
  const full = gallery.length >= MAX_GALLERY;

  async function upload(files: FileList | null, slot: ImageSlot) {
    const list = Array.from(files ?? []);
    const room = slot === "gallery" ? Math.max(0, MAX_GALLERY - gallery.length) : 1;
    const ok = list.filter((f) => ACCEPT.includes(f.type) && f.size <= MAX_BYTES).slice(0, room);
    setSkipped(list.filter((f) => !ok.includes(f)).map((f) => f.name));
    for (const [i, file] of ok.entries()) {
      setBusy(slot === "featured" ? "Uploading…" : `Uploading ${i + 1}/${ok.length}…`);
      try {
        await actions.addImage.mutateAsync({ file, slot });
      } catch {
        /* the toast already explained it; carry on with the rest */
      }
    }
    setBusy(null);
    for (const input of [featuredInput, galleryInput]) if (input.current) input.current.value = "";
  }

  const saveGallery = (next: string[]) => actions.update.mutate({ gallery_images: next });
  const move = (i: number, by: -1 | 1) => {
    const next = [...gallery];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    saveGallery(next);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1 font-display text-2xl">Photos <InfoTip text={getTooltip("developments.images")} /></h2>
        {busy && <span className="text-sm text-muted-foreground">{busy}</span>}
      </div>
      {skipped.length > 0 && (
        <p role="alert" className="text-sm text-danger">
          Skipped {skipped.join(", ")}: only JPG, PNG or WebP up to 10 MB{full ? `, and the gallery holds ${MAX_GALLERY}` : ""}.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Featured image</p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gold bg-surface-muted">
            {development.featured_image ? (
              <Image src={development.featured_image} alt={`${development.name} featured image`} fill sizes="18rem" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-sm text-muted-foreground">No featured image yet</span>
            )}
          </div>
          <Button size="sm" variant="outline" disabled={Boolean(busy)} onClick={() => featuredInput.current?.click()}>
            <ImagePlus className="size-4" /> {development.featured_image ? "Replace" : "Upload"}
          </Button>
          <input ref={featuredInput} type="file" accept={ACCEPT} hidden aria-label="Upload featured image" onChange={(e) => upload(e.target.files, "featured")} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gallery ({gallery.length}/{MAX_GALLERY})</p>
            <Button size="sm" variant="outline" disabled={Boolean(busy) || full} onClick={() => galleryInput.current?.click()}>
              <ImagePlus className="size-4" /> Add photos
            </Button>
            <input ref={galleryInput} type="file" accept={ACCEPT} multiple hidden aria-label="Upload gallery photos" onChange={(e) => upload(e.target.files, "gallery")} />
          </div>
          {gallery.length === 0 ? (
            <p className="rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">No gallery photos yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((url, i) => (
                <li key={url} className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="relative aspect-[4/3]">
                    <Image src={url} alt={`${development.name} gallery photo ${i + 1}`} fill sizes="(min-width: 1024px) 15vw, 45vw" className="object-cover" />
                  </div>
                  <div className="flex items-center justify-between p-1.5">
                    <div className="flex">
                      <button type="button" aria-label={`Move gallery photo ${i + 1} earlier`} disabled={i === 0 || actions.update.isPending} onClick={() => move(i, -1)}
                        className="rounded p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowLeft className="size-4" /></button>
                      <button type="button" aria-label={`Move gallery photo ${i + 1} later`} disabled={i === gallery.length - 1 || actions.update.isPending} onClick={() => move(i, 1)}
                        className="rounded p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowRight className="size-4" /></button>
                    </div>
                    <button type="button" aria-label={`Remove gallery photo ${i + 1}`} disabled={actions.update.isPending}
                      onClick={() => saveGallery(gallery.filter((_, j) => j !== i))}
                      className="rounded p-2 text-muted-foreground hover:text-danger disabled:opacity-30"><Trash2 className="size-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
