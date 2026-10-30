// Home page content, shaped like a headless CMS response: an ordered list of typed blocks.
// Blocks reference catalog data by slug and the storefront resolves it from commercetools at
// render time, so prices and images stay live. Swapping in a CMS only replaces this file.

export interface HeroBlock {
  type: "hero";
  eyebrow?: string;
  title: string;
  text: string;
  /** Short labels shown as pills, e.g. the tech stack */
  tags?: string[];
  cta: { label: string; href: string };
  /** Product whose image fills the hero */
  productSlug: string;
}

export interface CategoryTilesBlock {
  type: "categoryTiles";
  title: string;
  /** Each tile shows the category's first product image */
  categorySlugs: string[];
}

export interface ProductRailBlock {
  type: "productRail";
  title: string;
  categorySlug: string;
  limit: number;
}

export type HomeBlock = HeroBlock | CategoryTilesBlock | ProductRailBlock;

export const homeBlocks: HomeBlock[] = [
  {
    type: "hero",
    eyebrow: "IONA Commerce",
    title: "A tiny Commercetools store",
    text: "Built with Next.js, deployed on Vercel.",
    tags: ["Next.js", "React", "TypeScript", "Commercetools", "Tailwind CSS", "Vercel"],
    cta: { label: "Browse products", href: "/products" },
    productSlug: "nala-two-seater-sofa",
  },
  {
    type: "categoryTiles",
    title: "Shop by category",
    categorySlugs: ["furniture", "home-decor", "kitchen"],
  },
  {
    type: "productRail",
    title: "New arrivals",
    categorySlug: "new-arrivals",
    limit: 4,
  },
];
