"use client";

import Image from "next/image";
import { useRef } from "react";

import { breakpointQueries, gsap, useGSAP } from "@/lib/gsap";
import type { ProductImage } from "@/lib/types";

/**
 * One list of images, laid out per breakpoint: a full-bleed swipeable strip with a position line on
 * mobile, and a vertical stack with a subtle scroll parallax on desktop (next to the sticky product info).
 */
export function ProductGallery({ images }: { images: ProductImage[] }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!galleryRef.current) return;

      // Same breakpoint as the md: classes that switch between the strip and the stack
      const md = breakpointQueries("md");
      gsap.matchMedia().add(
        {
          desktop: md.above,
          mobile: md.below,
          motionOk: "(prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (conditions?.desktop && conditions.motionOk) {
            for (const tile of gsap.utils.toArray<HTMLElement>("[data-gallery-tile]", galleryRef.current)) {
              gsap.fromTo(
                tile.querySelector("img"),
                { yPercent: -5 },
                {
                  yPercent: 5,
                  ease: "none",
                  scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: true },
                },
              );
            }
          }

          if (conditions?.mobile && images.length > 1) {
            // The line is 1/n wide, so moving it (n - 1) widths spans the strip's whole scroll range
            gsap.to(indicatorRef.current, {
              xPercent: (images.length - 1) * 100,
              ease: "none",
              scrollTrigger: {
                scroller: trackRef.current,
                horizontal: true,
                start: 0,
                end: "max",
                // Glide slightly behind the finger, unless the user prefers reduced motion
                scrub: conditions.motionOk ? 0.3 : true,
              },
            });
          }
        },
      );
    },
    { scope: galleryRef },
  );

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-surface text-sm text-muted">
        No image
      </div>
    );
  }

  return (
    <div ref={galleryRef} className="relative -mx-4 md:mx-0">
      <ul
        ref={trackRef}
        aria-label="Product images"
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:flex-col md:gap-4 md:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <li
            key={image.url}
            data-gallery-tile
            className="relative aspect-square w-full shrink-0 snap-center overflow-hidden md:rounded-lg"
          >
            {/* Sample images vary in aspect ratio: fit them whole and blend white backgrounds into the tile */}
            <Image
              src={image.url}
              alt={image.alt}
              fill
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : undefined}
              // The page stops growing at max-w-6xl (1152px), so from there the column is a fixed ~630px
              sizes="(min-width: 1152px) 640px, (min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"
              className="object-contain px-0 pt-8 pb-4 mix-blend-multiply md:py-6 lg:py-10"
            />
          </li>
        ))}
      </ul>

      {images.length > 1 && (
        <div
          ref={indicatorRef}
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-foreground md:hidden"
          style={{ width: `${100 / images.length}%` }}
        />
      )}
    </div>
  );
}
