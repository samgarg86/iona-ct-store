import Link from "next/link";

import { NavItem, NavMenu, NavPanel, NavTrigger } from "@/components/nav/nav-state";
import { listingHref } from "@/lib/listing-params";
import type { CategoryNode } from "@/lib/types";

/** Content links appended after the catalog categories */
const CONTENT_LINKS = [{ label: "About", href: "/about" }];

const topLinkClass =
  "block py-3 font-medium lg:flex lg:items-center lg:border-b-2 lg:border-transparent lg:py-0 lg:hover:border-foreground";

interface MainNavProps {
  categories: CategoryNode[];
}

export function MainNav({ categories }: MainNavProps) {
  return (
    <NavMenu label="Main">
      <ul className="text-sm lg:flex lg:h-full lg:gap-6">
        {categories.map((category) =>
          category.children.length > 0 ? (
            <NavItem key={category.id} id={category.slug}>
              <NavTrigger id={category.slug}>{category.name}</NavTrigger>
              <NavPanel id={category.slug}>
                <CategoryPanel category={category} />
              </NavPanel>
            </NavItem>
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
    </NavMenu>
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
