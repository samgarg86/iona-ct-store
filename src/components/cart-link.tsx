import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { getCart } from "@/lib/commercetools/cart";

/** Header cart link with item count. Reads the cart cookie, so render it inside <Suspense>. */
export async function CartLink() {
  const cart = await getCart();
  return <CartLinkView count={cart?.totalQuantity ?? 0} />;
}

export function CartLinkView({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      className="relative -mr-2 rounded-md p-2 hover:bg-surface"
    >
      <ShoppingBag className="size-6" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-4.5 rounded-full bg-foreground px-1 text-center text-[0.6875rem] leading-4.5 font-medium text-background">
          {count}
        </span>
      )}
    </Link>
  );
}
