import Form from "next/form";
import Link from "next/link";

import { MainNav, NavDrawerButton } from "@/components/nav/main-nav";
import { NavProvider } from "@/components/nav/nav-dropdown";
import { getCategoryTree } from "@/lib/commercetools/categories";

export async function SiteHeader() {
  const categories = await getCategoryTree();

  return (
    <header className="relative border-b border-border bg-background">
      <NavProvider className="mx-auto flex h-16 max-w-6xl items-center gap-x-4 px-4 lg:gap-x-8">
        <NavDrawerButton />
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
