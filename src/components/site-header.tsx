import Form from "next/form";
import Link from "next/link";

import { MainNav } from "@/components/nav/main-nav";
import { NavDrawerToggle, NavProvider } from "@/components/nav/nav-state";
import { getCategoryTree } from "@/lib/commercetools/categories";

export async function SiteHeader() {
  const categories = await getCategoryTree();

  return (
    <header className="relative border-b border-border bg-background">
      <NavProvider className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 px-4 py-3 lg:h-16 lg:gap-x-8 lg:py-0">
        <NavDrawerToggle />
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Iona
        </Link>
        <MainNav categories={categories} />
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
      </NavProvider>
    </header>
  );
}
