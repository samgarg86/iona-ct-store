import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Price } from "@/components/price";
import { AddToCartForm } from "@/components/pdp/add-to-cart-form";
import { ProductGallery } from "@/components/pdp/product-gallery";
import { VariantPicker } from "@/components/pdp/variant-picker";
import { getCategories } from "@/lib/commercetools/categories";
import { getProductBySlug, searchProducts } from "@/lib/commercetools/products";
import { env } from "@/lib/env";
import { listingHref } from "@/lib/listing-params";
import type { Category, Product, ProductVariant } from "@/lib/types";
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ProductContent({ params, searchParams }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProductBySlug(slug), getCategories()]);
  if (!product) notFound();

  return (
    <>
      <Breadcrumbs trail={categoryTrail(product, categories)} productName={product.name} />

      {/* The static shell shows the master variant; the variant from ?sku= streams in */}
      <Suspense fallback={<ProductDetails product={product} variant={product.variants[0]} />}>
        <SelectedVariantDetails product={product} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SelectedVariantDetails({
  product,
  searchParams,
}: {
  product: Product;
  searchParams: PageProps<"/p/[slug]">["searchParams"];
}) {
  const { sku } = await searchParams;
  const variant = selectVariant(product, typeof sku === "string" ? sku : undefined);
  return <ProductDetails product={product} variant={variant} />;
}

function ProductDetails({ product, variant }: { product: Product; variant: ProductVariant }) {
  const purchasable = variant.inStock && variant.price !== undefined;

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <ProductGallery key={variant.sku} images={variant.images} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <Price price={variant.price} locale={env.locale} className="text-xl" />
          <p className={`text-sm ${variant.inStock ? "text-muted" : "text-accent"}`}>
            {variant.inStock ? "In stock" : "Out of stock"}
          </p>
        </div>

        {product.options.length > 0 && <VariantPicker product={product} selected={variant} />}

        <AddToCartForm sku={variant.sku} purchasable={purchasable} />

        {product.description && (
          <section className="flex flex-col gap-2 border-t border-border pt-6">
            <h2 className="text-sm font-medium">Description</h2>
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
          </section>
        )}

        {product.details.length > 0 && (
          <section className="flex flex-col gap-2 border-t border-border pt-6">
            <h2 className="text-sm font-medium">Details</h2>
            <ul className="list-disc pl-5 text-sm leading-relaxed text-muted">
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-xs text-muted">SKU {variant.sku}</p>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-6">
      <div className="h-5 w-64 rounded bg-surface" />
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="aspect-square rounded-lg bg-surface" />
        <div className="flex flex-col gap-3">
          <div className="h-9 w-3/4 rounded bg-surface" />
          <div className="h-7 w-24 rounded bg-surface" />
          <div className="mt-6 h-11 w-full rounded-full bg-surface" />
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({ trail, productName }: { trail: Category[]; productName: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <li>
          <Link href="/products" className="hover:text-foreground hover:underline">
            Shop
          </Link>
        </li>
        {trail.map((category) => (
          <li key={category.id} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            <Link href={listingHref({ category: category.slug })} className="hover:text-foreground hover:underline">
              {category.name}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-foreground">
            {productName}
          </span>
        </li>
      </ol>
    </nav>
  );
}

/** Ancestors-first path to the product's first category, e.g. [Furniture, Sofas]. */
function categoryTrail(product: Product, categories: Category[]): Category[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const trail: Category[] = [];
  let current = product.categoryIds.map((id) => byId.get(id)).find(Boolean);
  while (current && trail.length < 5) {
    trail.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return trail;
}

function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}
