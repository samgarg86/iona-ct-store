"use server";

import { refresh } from "next/cache";

import { addToCart } from "@/lib/commercetools/cart";
import { MAX_QUANTITY } from "@/lib/types";

export type AddToCartState =
  | { status: "idle" }
  | { status: "added"; quantity: number; at: number }
  | { status: "error"; message: string };

export async function addToCartAction(_previous: AddToCartState, formData: FormData): Promise<AddToCartState> {
  const sku = formData.get("sku");
  const quantity = Number(formData.get("quantity"));

  if (typeof sku !== "string" || !sku) {
    return { status: "error", message: "Please choose an option." };
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return { status: "error", message: `Quantity must be between 1 and ${MAX_QUANTITY}.` };
  }

  try {
    await addToCart(sku, quantity);
  } catch (error) {
    console.error("addToCart failed", error);
    return { status: "error", message: "We couldn’t add this to your cart. Please try again." };
  }

  // Re-render server components (like the header cart count) with the updated cart
  refresh();
  return { status: "added", quantity, at: Date.now() };
}
