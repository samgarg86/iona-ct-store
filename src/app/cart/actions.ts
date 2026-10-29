"use server";

import { refresh } from "next/cache";

import { addToCart, changeLineItemQuantity, removeLineItem } from "@/lib/commercetools/cart";
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

/** Result of a cart page update; on success the page re-renders with the updated cart */
export type CartUpdateResult = { error?: string };

const CART_EXPIRED = "Your cart has expired. Please add the items again.";

export async function changeQuantityAction(lineItemId: string, quantity: number): Promise<CartUpdateResult> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return { error: `Quantity must be between 1 and ${MAX_QUANTITY}.` };
  }

  try {
    const cart = await changeLineItemQuantity(lineItemId, quantity);
    if (!cart) return { error: CART_EXPIRED };
  } catch (error) {
    console.error("changeLineItemQuantity failed", error);
    return { error: "We couldn’t update the quantity. Please try again." };
  } finally {
    refresh();
  }
  return {};
}

export async function removeLineItemAction(lineItemId: string): Promise<CartUpdateResult> {
  try {
    const cart = await removeLineItem(lineItemId);
    if (!cart) return { error: CART_EXPIRED };
  } catch (error) {
    console.error("removeLineItem failed", error);
    return { error: "We couldn’t remove this item. Please try again." };
  } finally {
    refresh();
  }
  return {};
}
