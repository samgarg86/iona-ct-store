import type { Metadata } from "next";
import { Suspense } from "react";

import { CartView } from "@/components/cart/cart-view";
import { getCart } from "@/lib/commercetools/cart";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:py-8">
      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </main>
  );
}

async function CartContent() {
  const cart = await getCart();
  return <CartView cart={cart} locale={env.locale} />;
}

function CartSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-8">
      <div className="h-9 w-32 rounded bg-surface" />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-4">
              <div className="size-24 rounded-lg bg-surface" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-5 w-1/2 rounded bg-surface" />
                <div className="h-4 w-20 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-48 rounded-lg bg-surface" />
      </div>
    </div>
  );
}
