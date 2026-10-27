import "server-only";

import { cacheLife } from "next/cache";

import { apiRoot } from "@/lib/commercetools/client";
import { toCategory } from "@/lib/commercetools/mappers";
import { env } from "@/lib/env";
import type { Category, CategoryNode } from "@/lib/types";

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

/** Nests the flat category list; getCategories' orderHint sort carries over to each level. */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const categories = await getCategories();
  const childrenOf = new Map<string | undefined, Category[]>();
  for (const category of categories) {
    const siblings = childrenOf.get(category.parentId) ?? [];
    siblings.push(category);
    childrenOf.set(category.parentId, siblings);
  }

  const build = (parentId: string | undefined): CategoryNode[] =>
    (childrenOf.get(parentId) ?? []).map((category) => ({
      ...category,
      children: build(category.id),
    }));

  return build(undefined);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}
