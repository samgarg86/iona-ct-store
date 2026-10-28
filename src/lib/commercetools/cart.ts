import "server-only";

import type { Cart as CtCart } from "@commercetools/platform-sdk";
import { cookies } from "next/headers";
import { connection } from "next/server";

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

export async function getCart(): Promise<Cart | undefined> {
  const cart = await getActiveCart();
  return cart ? toCart(cart, env.locale) : undefined;
}

export async function addToCart(sku: string, quantity: number): Promise<Cart> {
  const cart = (await getActiveCart()) ?? (await createCart());

  const { body } = await apiRoot
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: [{ action: "addLineItem", sku, quantity }],
      },
    })
    .execute();

  return toCart(body, env.locale);
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 404;
}
