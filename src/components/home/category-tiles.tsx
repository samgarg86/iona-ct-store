import Image from "next/image";
import Link from "next/link";

import type { CategoryTilesBlock } from "@/content/home";
import { getCategories } from "@/lib/commercetools/categories";
import { getCategoryProducts } from "@/lib/commercetools/products";
import { listingHref } from "@/lib/listing-params";

export async function CategoryTiles({ title, categorySlugs }: CategoryTilesBlock) {
  const categories = await getCategories();
  // Skip slugs that no longer exist, as a CMS reference can go stale
  const tiles = await Promise.all(
    categorySlugs
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter((category) => category !== undefined)
      .map(async (category) => {
        const [product] = await getCategoryProducts(category.id, 1);
        return { category, image: product?.images[0] };
      }),
  );

  if (tiles.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <ul className="grid grid-cols-3 gap-3 sm:gap-4">
        {tiles.map(({ category, image }) => (
          <li key={category.id}>
            <Link href={listingHref({ category: category.slug })} className="group flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-surface sm:aspect-[4/5]">
                {image && (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="(min-width: 1152px) 368px, 33vw"
                    className="object-contain p-3 mix-blend-multiply sm:p-6 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                  />
                )}
              </div>
              <p className="text-sm font-medium group-hover:underline sm:text-base">{category.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
