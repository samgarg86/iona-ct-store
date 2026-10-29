import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Price } from "@/components/price";
import { AddToCartForm } from "@/components/pdp/add-to-cart-form";
import { ProductGallery } from "@/components/pdp/product-gallery";
import { VariantPicker } from "@/components/pdp/variant-picker";
import { getCategoryTrail } from "@/lib/commercetools/categories";
import { getProductBySlug, searchProducts } from "@/lib/commercetools/products";
import { env } from "@/lib/env";
import type { Product, ProductVariant } from "@/lib/types";
import { selectVariant } from "@/lib/variants";

/** Prerender the first page of the catalog; other products render on first request. */
export async function generateStaticParams() {
  const { products } = await searchProducts({ sort: "featured", page: 1 });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.variants[0]?.images[0];
  return {
    title: product.name,
    description: truncate(product.description, 160),
    openGraph: { images: image ? [{ url: image.url, alt: image.alt }] : undefined },
  };
}

export default function ProductPage({ params, searchParams }: PageProps<"/p/[slug]">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 md:pt-8">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ProductContent({ params, searchParams }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const trail = await getCategoryTrail(product.categoryIds[0]);
  const breadcrumbs = <Breadcrumbs trail={trail} current={product.name} />;

  return (
    // The static shell shows the master variant; the variant from ?sku= streams in
    <Suspense fallback={<ProductDetails product={product} variant={product.variants[0]} breadcrumbs={breadcrumbs} />}>
      <SelectedVariantDetails product={product} searchParams={searchParams} breadcrumbs={breadcrumbs} />
    </Suspense>
  );
}

async function SelectedVariantDetails({
  product,
  searchParams,
  breadcrumbs,
}: {
  product: Product;
  searchParams: PageProps<"/p/[slug]">["searchParams"];
  breadcrumbs: ReactNode;
}) {
  const { sku } = await searchParams;
  const variant = selectVariant(product, typeof sku === "string" ? sku : undefined);
  return <ProductDetails product={product} variant={variant} breadcrumbs={breadcrumbs} />;
}

interface ProductDetailsProps {
  product: Product;
  variant: ProductVariant;
  breadcrumbs: ReactNode;
}

function ProductDetails({ product, variant, breadcrumbs }: ProductDetailsProps) {
  const purchasable = variant.inStock && variant.price !== undefined;

  return (
    <div className="relative grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[7fr_5fr]">
      <ProductGallery key={variant.sku} images={variant.images} />

      {/* On desktop the info column stays in view while the stacked gallery scrolls past */}
      <div className="flex flex-col gap-6 md:sticky md:top-22 lg:top-24 md:self-start">
        <div className="flex flex-col gap-2">
          {/* Mobile: overlaid on the top of the gallery (positioned against the grid), letting swipes
              through except on the links. Desktop: above the name. */}
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 md:pointer-events-auto md:static md:mb-2 [&_a]:pointer-events-auto">
            {breadcrumbs}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <Price price={variant.price} locale={env.locale} className="text-xl" />
          <p className={`text-sm ${variant.inStock ? "text-muted" : "text-accent"}`}>
            {variant.inStock ? "In stock" : "Out of stock"}
          </p>
        </div>

        {product.options.length > 0 && <VariantPicker product={product} selected={variant} />}

        <AddToCartForm sku={variant.sku} purchasable={purchasable} />

        <div className="flex flex-col border-b border-border">
          {product.description && (
            <InfoSection title="Description" open>
              <p>{product.description}</p>
            </InfoSection>
          )}
          {product.details.length > 0 && (
            <InfoSection title="Details">
              <ul className="list-disc pl-5">
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </InfoSection>
          )}
        </div>

        <p className="text-xs text-muted">SKU {variant.sku}</p>
      </div>
    </div>
  );
}

function InfoSection({ title, open, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-lg leading-none text-muted transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[7fr_5fr]">
        <div className="-mx-4 aspect-square bg-surface md:mx-0 md:rounded-lg" />
        <div className="flex flex-col gap-3">
          <div className="mb-2 hidden h-4 w-64 rounded bg-surface md:block" />
          <div className="h-9 w-3/4 rounded bg-surface" />
          <div className="h-7 w-24 rounded bg-surface" />
          <div className="mt-6 h-11 w-full rounded-full bg-surface" />
        </div>
      </div>
    </div>
  );
}

function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}
