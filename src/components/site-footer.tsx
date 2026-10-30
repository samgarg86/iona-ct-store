import Image from "next/image";
import Link from "next/link";

import { getCategoryTree } from "@/lib/commercetools/categories";
import { listingHref } from "@/lib/listing-params";

const REPO_URL = "https://github.com/samgarg86/iona-ct-store";

/** commercetools only publishes a raster logo, so all three are greyed with CSS filters, not fill */
const BUILT_WITH = [
  {
    name: "commercetools",
    href: "https://commercetools.com",
    src: "/logos/commercetools.png",
    width: 344,
    height: 96,
    className: "h-7",
  },
  { name: "Next.js", href: "https://nextjs.org", src: "/logos/nextjs.svg", width: 278, height: 56, className: "h-4" },
  { name: "Vercel", href: "https://vercel.com", src: "/logos/vercel.svg", width: 261, height: 52, className: "h-4" },
];

const headingClass = "font-medium";
const linkClass = "whitespace-nowrap text-muted hover:text-foreground";

/**
 * Brand blurb and link columns packed to the left with fixed gaps, and the "Built with" logos
 * pushed to the right edge. Below `lg` the brand and logos span full width, and the link columns
 * sit side by side between them.
 */
export async function SiteFooter() {
  const categories = await getCategoryTree();

  return (
    <footer className="mt-auto border-t border-border text-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 lg:flex lg:gap-20">
        <div className="col-span-2 flex flex-col gap-2 lg:max-w-xs">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Iona
          </Link>
          <p className="text-muted">A demo storefront built with Next.js and commercetools.</p>
        </div>
        <nav aria-labelledby="footer-shop" className="flex flex-col gap-3">
          <h2 id="footer-shop" className={headingClass}>
            Shop
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/products" className={linkClass}>
                Shop all
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={listingHref({ category: category.slug })} className={linkClass}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-3">
          <h2 className={headingClass}>Project</h2>
          <a href={REPO_URL} className={linkClass}>
            Source on GitHub
          </a>
        </div>
        <div className="col-span-2 flex flex-col gap-3 lg:ml-auto">
          <h2 className={headingClass}>Built with</h2>
          <ul className="flex items-center gap-5">
            {BUILT_WITH.map(({ name, href, src, width, height, className }) => (
              <li key={name}>
                <a href={href} className="block opacity-50 grayscale transition hover:opacity-100 hover:grayscale-0">
                  <Image src={src} alt={name} width={width} height={height} className={`w-auto ${className}`} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-border py-3 text-center text-muted">© 2026 Sam Garg</p>
    </footer>
  );
}
