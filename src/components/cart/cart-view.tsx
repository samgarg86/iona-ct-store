"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition } from "react";

import { changeQuantityAction, removeLineItemAction } from "@/app/cart/actions";
import { Price } from "@/components/price";
import { formatMoney } from "@/lib/format";
import { MAX_QUANTITY, type Cart, type CartLineItem } from "@/lib/types";
import { productHref } from "@/lib/variants";

interface CartViewProps {
  cart?: Cart;
  locale: string;
}

/** A quantity change; 0 removes the line item */
interface LineItemUpdate {
  lineItemId: string;
  quantity: number;
}

export function CartView({ cart, locale }: CartViewProps) {
  // Quantities and removals show at once; totals are only known once the server cart arrives
  const [lineItems, applyUpdate] = useOptimistic(cart?.lineItems ?? [], (items, update: LineItemUpdate) =>
    update.quantity === 0
      ? items.filter((item) => item.id !== update.lineItemId)
      : items.map((item) => (item.id === update.lineItemId ? { ...item, quantity: update.quantity } : item)),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  function update(lineItemId: string, quantity: number) {
    setError(undefined);
    // The removed row takes the focused button with it, so keep focus on the page
    if (quantity === 0) headingRef.current?.focus();
    startTransition(async () => {
      applyUpdate({ lineItemId, quantity });
      const result =
        quantity === 0 ? await removeLineItemAction(lineItemId) : await changeQuantityAction(lineItemId, quantity);
      if (result.error) setError(result.error);
    });
  }

  const itemCount = lineItems.reduce((count, item) => count + item.quantity, 0);
  const totalsClass = `transition-opacity ${pending ? "opacity-40" : ""}`;

  return (
    <div className="flex flex-col gap-8">
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold tracking-tight outline-none">
        Cart
        {itemCount > 0 && (
          <span className="ml-3 text-base font-normal text-muted">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        )}
      </h1>

      <p aria-live="polite" className="text-sm text-accent empty:hidden">
        {error}
      </p>

      {lineItems.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg">Your cart is empty.</p>
          <Link href="/products" className="rounded-full bg-foreground px-5 py-2 text-sm text-background">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <ul className="flex flex-col self-start divide-y divide-border border-y border-border">
            {lineItems.map((item) => (
              <li key={item.id}>
                <LineItemRow
                  item={item}
                  locale={locale}
                  totalsClass={totalsClass}
                  onQuantityChange={(quantity) => update(item.id, quantity)}
                />
              </li>
            ))}
          </ul>

          <section aria-labelledby="summary-heading" className="flex flex-col gap-4 self-start rounded-lg bg-surface p-6 lg:sticky lg:top-24">
            <h2 id="summary-heading" className="font-medium">
              Order summary
            </h2>
            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span>Subtotal</span>
              <span aria-busy={pending} className={`text-lg font-medium ${totalsClass}`}>
                {cart && formatMoney(cart.total, locale)}
              </span>
            </div>
            <p className="text-sm text-muted">Shipping and taxes are calculated at checkout.</p>
            <button
              type="button"
              disabled
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Checkout
            </button>
            <p className="-mt-2 text-center text-xs text-muted">Checkout isn’t part of this demo.</p>
            <Link href="/products" className="text-center text-sm font-medium underline">
              Continue shopping
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}

interface LineItemRowProps {
  item: CartLineItem;
  locale: string;
  totalsClass: string;
  onQuantityChange: (quantity: number) => void;
}

function LineItemRow({ item, locale, totalsClass, onQuantityChange }: LineItemRowProps) {
  const href = productHref(item.productSlug, item.sku);
  const stepperButton =
    "flex size-9 items-center justify-center transition-colors hover:bg-surface disabled:text-muted disabled:hover:bg-transparent";

  return (
    <div className="flex gap-4 py-5">
      {/* Same destination as the name link, so keep it out of the tab order and screen reader output */}
      <Link href={href} tabIndex={-1} aria-hidden className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-surface">
        {item.image && (
          <Image
            src={item.image.url}
            alt={item.image.alt}
            fill
            sizes="6rem"
            className="object-contain p-2 mix-blend-multiply"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link href={href} className="leading-snug hover:underline">
              {item.name}
            </Link>
            <Price price={item.price} locale={locale} className="text-sm" />
          </div>
          <p className={`font-medium ${totalsClass}`}>{formatMoney(item.total, locale)}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.min(MAX_QUANTITY, item.quantity - 1))}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.name}`}
              className={`${stepperButton} rounded-l-full`}
            >
              −
            </button>
            <span className="w-8 text-center text-sm tabular-nums">
              <span className="sr-only">Quantity </span>
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= MAX_QUANTITY}
              aria-label={`Increase quantity of ${item.name}`}
              className={`${stepperButton} rounded-r-full`}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => onQuantityChange(0)}
            aria-label={`Remove ${item.name}`}
            className="text-sm text-muted underline hover:text-foreground"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
