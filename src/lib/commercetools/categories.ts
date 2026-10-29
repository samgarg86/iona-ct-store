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

/**
 * Categories to drill into from a listing: the category's children, or its siblings when it has
 * none, so shoppers can hop between e.g. Tables, Chairs and Sofas. Top-level categories without one.
 */
export async function getBrowseCategories(category: Category | undefined): Promise<Category[]> {
  const categories = await getCategories();
  const children = categories.filter((candidate) => candidate.parentId === category?.id);
  if (children.length > 0 || !category) return children;
  return categories.filter((candidate) => candidate.parentId === category.parentId);
}

/** Ancestors-first path ending at the given category, e.g. [Furniture, Sofas]. */
export async function getCategoryTrail(categoryId: string | undefined): Promise<Category[]> {
  const categories = await getCategories();
  const byId = new Map(categories.map((category) => [category.id, category]));
  const trail: Category[] = [];
  let current = categoryId ? byId.get(categoryId) : undefined;
  while (current && trail.length < 5) {
    trail.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return trail;
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
