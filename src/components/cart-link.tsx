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
      className="flex items-center gap-1.5 text-sm hover:underline"
    >
      Cart
      {count > 0 && (
        <span className="min-w-5 rounded-full bg-foreground px-1.5 text-center text-xs leading-5 text-background">
          {count}
        </span>
      )}
    </Link>
  );
}
