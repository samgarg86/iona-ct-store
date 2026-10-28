import { Menu, X } from "lucide-react";
import Link from "next/link";

import { NavDropdown } from "@/components/nav/nav-dropdown";
import { listingHref } from "@/lib/listing-params";
import type { CategoryNode } from "@/lib/types";

export const MAIN_NAV_ID = "main-nav";

/** Content links appended after the catalog categories */
const CONTENT_LINKS = [{ label: "About", href: "/about" }];

const topLinkClass =
  "block py-3 font-medium lg:flex lg:items-center lg:border-b-2 lg:border-transparent lg:py-0 lg:hover:border-foreground";

const iconButtonClass = "rounded-md p-2 hover:bg-surface lg:hidden";

/** Opens the mobile drawer; the browser handles the popover's open state, Escape and backdrop. */
export function NavDrawerButton() {
  return (
    <button type="button" popoverTarget={MAIN_NAV_ID} className={`-ml-2 ${iconButtonClass}`}>
      <span className="sr-only">Open menu</span>
      <Menu className="size-6" strokeWidth={1.5} />
    </button>
  );
}

interface MainNavProps {
  categories: CategoryNode[];
}

/**
 * One nav for every screen size. Below `lg` it is a drawer inside a full-screen popover, sliding in
 * over a backdrop. The backdrop is a real button: a popover's `::backdrop` lets taps fall through
 * to the page. From `lg` up the popover becomes `display: contents` (overriding the browser's
 * hidden-popover `display: none`) and the nav sits inline in the header. Desktop uses
 * `translate-none`, not `translate-x-0`: any translate makes the nav the containing block, and the
 * panels must position against the full-width header.
 */
export function MainNav({ categories }: MainNavProps) {
  return (
    <div
      id={MAIN_NAV_ID}
      popover="auto"
      className="group fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-transparent p-0 text-foreground transition-[display,overlay] transition-discrete duration-200 motion-reduce:transition-none lg:contents"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        popoverTarget={MAIN_NAV_ID}
        popoverTargetAction="hide"
        className="absolute inset-0 bg-foreground/40 opacity-0 transition-opacity duration-200 group-open:opacity-100 starting:group-open:opacity-0 motion-reduce:transition-none lg:hidden"
      />
      <nav
        aria-label="Main"
        className="relative h-full w-[85%] max-w-sm -translate-x-full overflow-y-auto bg-background px-4 pb-8 shadow-xl transition-[translate] duration-200 group-open:translate-x-0 starting:group-open:-translate-x-full motion-reduce:transition-none lg:static lg:h-auto lg:w-auto lg:max-w-none lg:translate-none lg:self-stretch lg:overflow-visible lg:bg-transparent lg:px-0 lg:pb-0 lg:shadow-none lg:transition-none"
      >
        <div className="flex h-16 items-center justify-between border-b border-border lg:hidden">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Iona
          </Link>
          <button
            type="button"
            popoverTarget={MAIN_NAV_ID}
            popoverTargetAction="hide"
            className={`-mr-2 ${iconButtonClass}`}
          >
            <span className="sr-only">Close menu</span>
            <X className="size-6" strokeWidth={1.5} />
          </button>
        </div>
        <ul className="text-sm lg:flex lg:h-full lg:gap-6">
          {categories.map((category) =>
            category.children.length > 0 ? (
              <NavDropdown key={category.id} id={category.slug} label={category.name}>
                <CategoryPanel category={category} />
              </NavDropdown>
            ) : (
              <li key={category.id} className="border-b border-border lg:flex lg:border-0">
                <Link href={listingHref({ category: category.slug })} className={topLinkClass}>
                  {category.name}
                </Link>
              </li>
            ),
          )}
          {CONTENT_LINKS.map((link) => (
            <li key={link.href} className="border-b border-border lg:flex lg:border-0">
              <Link href={link.href} className={topLinkClass}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function CategoryPanel({ category }: { category: CategoryNode }) {
  return (
    <div className="lg:mx-auto lg:max-w-6xl lg:px-4 lg:py-8">
      <Link
        href={listingHref({ category: category.slug })}
        className="inline-block pb-3 font-medium text-accent hover:underline lg:pb-6"
      >
        Shop all {category.name}
      </Link>
      <ul className="grid gap-4 pl-3 lg:grid-cols-4 lg:gap-8 lg:pl-0">
        {category.children.map((group) => (
          <li key={group.id}>
            <Link
              href={listingHref({ category: group.slug })}
              className="font-medium hover:underline"
            >
              {group.name}
            </Link>
            {group.children.length > 0 && (
              <ul className="mt-2 space-y-2 border-l border-border pl-3 lg:mt-3 lg:border-0 lg:pl-0">
                {group.children.map((leaf) => (
                  <li key={leaf.id}>
                    <Link
                      href={listingHref({ category: leaf.slug })}
                      className="text-muted hover:text-foreground"
                    >
                      {leaf.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
