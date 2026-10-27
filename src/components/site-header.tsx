import Form from "next/form";
import Link from "next/link";

import { getTopLevelCategories } from "@/lib/commercetools/categories";
import { listingHref } from "@/lib/listing-params";

export async function SiteHeader() {
  const categories = await getTopLevelCategories();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Iona
        </Link>
        <nav aria-label="Main" className="order-last w-full sm:order-none sm:w-auto">
          <ul className="flex gap-5 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={listingHref({ category: category.slug })} className="hover:underline">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Form action="/products" role="search" className="ml-auto">
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search products"
            className="w-40 rounded-full border border-border bg-background px-4 py-1.5 text-sm sm:w-56"
          />
        </Form>
      </div>
    </header>
  );
}
