// Home page content, shaped like a headless CMS response: an ordered list of typed blocks.
// Blocks reference catalog data by slug and the storefront resolves it from commercetools at
// render time, so prices and images stay live. Swapping in a CMS only replaces this file.

export interface HeroBlock {
  type: "hero";
  eyebrow?: string;
  title: string;
  text: string;
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
    eyebrow: "New season",
    title: "Pieces made for slow living",
    text: "Soft sofas, honest materials and table settings worth lingering over.",
    cta: { label: "Shop new arrivals", href: "/products?category=new-arrivals" },
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
    limit: 8,
  },
];
