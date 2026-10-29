import "server-only";

import type { Cart as CtCart, CartUpdateAction } from "@commercetools/platform-sdk";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";

import { apiRoot } from "@/lib/commercetools/client";
import { toCart } from "@/lib/commercetools/mappers";
import { env } from "@/lib/env";
import type { Cart } from "@/lib/types";

const CART_COOKIE = "cartId";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** Loads the shopper's active cart from the cart cookie, if there is one. */
async function getActiveCart(): Promise<CtCart | undefined> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return undefined;

  // Carts are per request and never cached; keep the fetch out of prerenders and prefetches
  await connection();
  try {
    const { body } = await apiRoot.carts().withId({ ID: cartId }).get().execute();
    return body.cartState === "Active" ? body : undefined;
  } catch (error) {
    // The cart may have been deleted or expired; treat it as no cart
    if (isNotFound(error)) return undefined;
    throw error;
  }
}

async function createCart(): Promise<CtCart> {
  const { body } = await apiRoot
    .carts()
    .post({ body: { currency: env.currency, country: env.country } })
    .execute();

  // Only Server Actions may set cookies, so cart creation is reachable from actions only
  (await cookies()).set(CART_COOKIE, body.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return body;
}

/**
 * The shopper's cart for display. Memoized per request so the header and page share one fetch;
 * updates read the cart uncached so they always send its latest version.
 */
export const getCart = cache(async (): Promise<Cart | undefined> => {
  const cart = await getActiveCart();
  return cart ? toCart(cart, env.locale) : undefined;
});

export async function addToCart(sku: string, quantity: number): Promise<Cart> {
  const cart = (await getActiveCart()) ?? (await createCart());
  return updateCart(cart, [{ action: "addLineItem", sku, quantity }]);
}

/** Sets a line item's quantity. Returns undefined when the shopper has no active cart. */
export async function changeLineItemQuantity(lineItemId: string, quantity: number): Promise<Cart | undefined> {
  const cart = await getActiveCart();
  if (!cart) return undefined;
  return updateCart(cart, [{ action: "changeLineItemQuantity", lineItemId, quantity }]);
}

/** Removes a line item. Returns undefined when the shopper has no active cart. */
export async function removeLineItem(lineItemId: string): Promise<Cart | undefined> {
  const cart = await getActiveCart();
  if (!cart) return undefined;
  return updateCart(cart, [{ action: "removeLineItem", lineItemId }]);
}

async function updateCart(cart: CtCart, actions: CartUpdateAction[]): Promise<Cart> {
  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({ body: { version: cart.version, actions } })
    .execute();

  return toCart(body, env.locale);
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 404;
}
