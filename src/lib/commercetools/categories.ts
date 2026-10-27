import "server-only";

import { cacheLife } from "next/cache";

import { apiRoot } from "@/lib/commercetools/client";
import { toCategory } from "@/lib/commercetools/mappers";
import { env } from "@/lib/env";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");

  const { body } = await apiRoot
    .categories()
    .get({ queryArgs: { limit: 500, sort: "orderHint asc" } })
    .execute();

  return body.results.map((category) => toCategory(category, env.locale));
}

export async function getTopLevelCategories(): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((category) => !category.parentId);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}
