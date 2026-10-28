import Link from "next/link";
import { Suspense } from "react";

import { CartLink, CartLinkView } from "@/components/cart-link";
import { MainNav, NavDrawerButton } from "@/components/nav/main-nav";
import { NavProvider } from "@/components/nav/nav-dropdown";
import { MobileSearch } from "@/components/mobile-search";
import { SearchForm } from "@/components/site-search";
import { getCategoryTree } from "@/lib/commercetools/categories";

/**
 * Below `lg`: menu | centred logo | search + cart (the two outer groups share the spare width
 * equally, which keeps the logo centred). Opening mobile search grows the header to reveal its
 * search row. From `lg` up: logo | nav | search field + cart.
 */
export async function SiteHeader() {
  const categories = await getCategoryTree();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md transition-[padding] duration-200 ease-out motion-reduce:transition-none has-data-search-open:pb-12 max-lg:overflow-hidden">
      <NavProvider className="mx-auto flex h-14 max-w-6xl items-center px-4 lg:h-16 lg:gap-x-8">
        <div className="flex flex-1 lg:hidden">
          <NavDrawerButton />
        </div>
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Iona
        </Link>
        <MainNav categories={categories} />
        <div className="flex flex-1 items-center justify-end lg:gap-x-4">
          <SearchForm id="site-search" className="hidden w-56 lg:block xl:w-64" />
          <MobileSearch />
          <Suspense fallback={<CartLinkView count={0} />}>
            <CartLink />
          </Suspense>
        </div>
      </NavProvider>
    </header>
  );
}
