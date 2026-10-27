"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [index, setIndex] = useState(0);
  const image = images[index] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No image</div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-3" aria-label="Product images">
          {images.map((thumbnail, thumbnailIndex) => (
            <li key={thumbnail.url}>
              <button
                type="button"
                onClick={() => setIndex(thumbnailIndex)}
                aria-label={`Show image ${thumbnailIndex + 1} of ${images.length}`}
                aria-current={thumbnailIndex === index ? "true" : undefined}
                className={`relative block size-20 overflow-hidden rounded-md border-2 bg-surface transition-colors ${
                  thumbnailIndex === index ? "border-foreground" : "border-transparent hover:border-border"
                }`}
              >
                <Image src={thumbnail.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
