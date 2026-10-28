"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/lib/types";

// Sample images vary in aspect ratio, so fit them whole into the tile and multiply-blend their
// white backgrounds into the tile color (same treatment as the PLP cards)
const imageClass = "object-contain p-6 mix-blend-multiply lg:p-10";

/** Mobile: one large image with thumbnails. Desktop: all images stacked, next to sticky product info. */
export function ProductGallery({ images }: { images: ProductImage[] }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-surface text-sm text-muted">
        No image
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden">
        <ThumbnailGallery images={images} />
      </div>
      <StackedGallery images={images} />
    </>
  );
}

function ThumbnailGallery({ images }: { images: ProductImage[] }) {
  const [index, setIndex] = useState(0);
  const image = images[index] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <Image src={image.url} alt={image.alt} fill priority sizes="100vw" className={imageClass} />
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
                <Image
                  src={thumbnail.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1.5 mix-blend-multiply"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StackedGallery({ images }: { images: ProductImage[] }) {
  return (
    <ul className="hidden flex-col gap-4 md:flex" aria-label="Product images">
      {images.map((image, index) => (
        <li key={image.url} className="gallery-tile relative aspect-square overflow-hidden rounded-lg bg-surface">
          {/* The drift wrapper moves slightly as the tile scrolls through the viewport. Its animation
              creates a stacking context, so it needs its own background for the image to blend into. */}
          <div className="gallery-drift absolute inset-0 bg-surface">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 58vw, 50vw"
              className={imageClass}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
