"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { addToCartAction, type AddToCartState } from "@/app/cart/actions";
import { MAX_QUANTITY } from "@/lib/types";

interface AddToCartFormProps {
  sku: string;
  /** False when the variant is out of stock or has no price */
  purchasable: boolean;
}

export function AddToCartForm({ sku, purchasable }: AddToCartFormProps) {
  const [state, formAction, pending] = useActionState<AddToCartState, FormData>(addToCartAction, {
    status: "idle",
  });
  const [quantity, setQuantity] = useState(1);

  const stepperButton =
    "flex size-10 items-center justify-center text-lg transition-colors hover:bg-surface disabled:text-muted disabled:hover:bg-transparent";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="sku" value={sku} />
      <div className="flex gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className={`${stepperButton} rounded-l-full`}
          >
            −
          </button>
          <label htmlFor="quantity" className="sr-only">
            Quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QUANTITY}
            value={quantity}
            onChange={(event) => setQuantity(clampQuantity(event.target.valueAsNumber))}
            className="w-10 bg-transparent text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Increase quantity"
            className={`${stepperButton} rounded-r-full`}
          >
            +
          </button>
        </div>
        <button
          type="submit"
          disabled={!purchasable || pending}
          className="flex-1 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!purchasable ? "Out of stock" : pending ? "Adding…" : "Add to cart"}
        </button>
      </div>

      <p aria-live="polite" className="min-h-5 text-sm">
        {state.status === "added" && (
          <span key={state.at}>
            Added {state.quantity} to your cart.{" "}
            <Link href="/cart" className="font-medium underline">
              View cart
            </Link>
          </span>
        )}
        {state.status === "error" && <span className="text-accent">{state.message}</span>}
      </p>
    </form>
  );
}

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));
}
