import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/price";
import type { ProductSummary } from "@/lib/types";
import { productHref } from "@/lib/variants";

interface ProductCardProps {
  product: ProductSummary;
  locale: string;
  /** Load eagerly for cards above the fold */
  priority?: boolean;
}

export function ProductCard({ product, locale, priority }: ProductCardProps) {
  const [image, hoverImage] = product.images;
  // Sample images vary in aspect ratio, so fit them whole into the square tile. Multiply blending
  // lets their white backgrounds take on the tile color instead of showing as white bands.
  const imageClass = "object-contain p-4 mix-blend-multiply transition-opacity duration-300";

  return (
    <Link href={productHref(product.slug)} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              priority={priority}
              // Hide fully on hover: a contained hover image may not cover it
              className={`${imageClass} ${hoverImage ? "group-hover:opacity-0" : "group-hover:opacity-90"}`}
            />
            {hoverImage && (
              <Image
                src={hoverImage.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={`${imageClass} opacity-0 group-hover:opacity-100`}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No image</div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-sm leading-snug group-hover:underline">{product.name}</h2>
        <Price price={product.price} locale={locale} className="text-sm" />
      </div>
    </Link>
  );
}
