import Image from "next/image";
import Link from "next/link";

import type { HeroBlock } from "@/content/home";
import { getProductBySlug } from "@/lib/commercetools/products";

export async function Hero({ eyebrow, title, text, tags, cta, productSlug }: HeroBlock) {
  const product = await getProductBySlug(productSlug);
  const image = product?.variants[0]?.images[0];

  return (
    <section className="grid overflow-hidden rounded-2xl bg-surface lg:grid-cols-2">
      <div className="flex flex-col items-start justify-center gap-4 px-6 py-10 sm:px-10 lg:py-16">
        {eyebrow && <p className="text-sm font-medium uppercase tracking-wider text-accent">{eyebrow}</p>}
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="max-w-md text-lg text-muted text-pretty">{text}</p>
        {tags && (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={cta.href}
          className="mt-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          {cta.label}
        </Link>
      </div>
      {image && (
        <div className="relative -mt-6 aspect-[16/10] lg:mt-0 lg:aspect-auto">
          {/* Multiply blending lets the white product backdrop take on the surface color */}
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            loading="eager"
            fetchPriority="high"
            className="object-contain p-6 mix-blend-multiply"
          />
        </div>
      )}
    </section>
  );
}
