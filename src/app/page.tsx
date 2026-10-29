import { CategoryTiles } from "@/components/home/category-tiles";
import { Hero } from "@/components/home/hero";
import { ProductRail } from "@/components/home/product-rail";
import { homeBlocks, type HomeBlock } from "@/content/home";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-6 lg:gap-16">
      {homeBlocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </main>
  );
}

/** Renders a content block with the component registered for its type */
function Block({ block }: { block: HomeBlock }) {
  switch (block.type) {
    case "hero":
      return <Hero {...block} />;
    case "categoryTiles":
      return <CategoryTiles {...block} />;
    case "productRail":
      return <ProductRail {...block} />;
  }
}
