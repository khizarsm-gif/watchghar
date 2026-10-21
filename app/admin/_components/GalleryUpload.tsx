"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // matches the bucket's 5 MB limit
const MAX_PHOTOS = 8;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Extra photos of the same watch. Each file is uploaded straight from the
 * browser to Supabase Storage (admins only), and every photo URL is submitted
 * as a repeated hidden `name` field. Customers see these as thumbnails on the
 * product page; the main photo (above) is the one used in the shop grid.
 */
export default function GalleryUpload({
  name,
  defaultValue,
  slugHint,
  onUploadingChange,
}: {
  name: string;
  defaultValue?: string[];
  slugHint: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  async function uploadFiles(files: File[]) {
    setError(null);
    const room = MAX_PHOTOS - urls.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_PHOTOS} extra photos.`);
      return;
    }
    const picked = files.slice(0, room);
    if (files.length > room) setError(`Only the first ${room} photo(s) were added (max ${MAX_PHOTOS}).`);

    setBusy(true);
    const added: string[] = [];
    try {
      const supabase = createClient();
      for (const file of picked) {
        if (!ALLOWED.includes(file.type)) {
          setError("Use JPG, PNG, WebP or GIF images only.");
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(`${file.name} is over 5 MB and was skipped.`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${slugHint || "product"}-more-${Date.now()}-${added.length}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        added.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
      }
    } catch (err) {
      console.error("[GalleryUpload]", err);
      setError(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed.");
    } finally {
      if (added.length) setUrls((prev) => [...prev, ...added]);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {urls.map((u) => (
        <input key={u} type="hidden" name={name} value={u} />
      ))}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((u) => (
          <div key={u} className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200">
            {/* Plain img: the URL may be any https host. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="Extra product photo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setUrls((prev) => prev.filter((x) => x !== u))}
              aria-label="Remove photo"
              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-700 shadow hover:bg-surface"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        {urls.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-2 text-center text-xs text-gray-600 hover:border-brand-500"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-6 w-6 text-gray-400" aria-hidden="true" />
            )}
            {uploading ? "Uploading…" : "Add photos"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) void uploadFiles(files);
        }}
      />
      <p className="mt-2 text-xs text-gray-500">
        Up to {MAX_PHOTOS} extra photos of this same watch. Customers see them as thumbnails on the product page.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
