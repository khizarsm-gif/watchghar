import { getSupabaseClient } from "@/lib/supabase";
import type { Product } from "@/types";

/**
 * PRODUCT DATA ACCESS, backed by the Supabase `products` table.
 *
 * Every page reads through these functions rather than querying Supabase
 * directly. Reads use the public (anon) client and are cached with the
 * "catalog" tag; the admin portal (/admin/products) purges that tag after
 * each change. `category` must match a slug in the `categories` table.
 */

export interface ProductRow {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  key_info: string[] | null;
  price: string | number;
  sale_price: string | number | null;
  image: string;
  gallery: string[] | null;
  stock: number;
  sku: string;
  group_key: string | null;
  group_name: string | null;
  variant_label: string | null;
  free_delivery: boolean;
  featured: boolean;
  created_at: string;
  is_demo: boolean;
}

export function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: row.category,
    description: row.description,
    keyInfo: row.key_info ?? [],
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    image: row.image,
    gallery: row.gallery ?? [],
    stock: row.stock,
    sku: row.sku,
    groupKey: row.group_key ?? undefined,
    groupName: row.group_name ?? undefined,
    variantLabel: row.variant_label ?? undefined,
    freeDelivery: row.free_delivery ?? false,
    featured: row.featured,
    createdAt: row.created_at,
    isDemo: row.is_demo,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(`getAllProducts: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getProductById: ${error.message}`);
  return data ? mapRow(data as ProductRow) : undefined;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`getProductBySlug: ${error.message}`);
  return data ? mapRow(data as ProductRow) : undefined;
}

/** All colours of one watch (same group), in article-letter order: WGA-48a, 48b, ... */
export async function getProductsByGroup(groupKey: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("group_key", groupKey)
    .order("sku", { ascending: true });

  if (error) throw new Error(`getProductsByGroup: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: true });

  if (error) throw new Error(`getProductsByCategory: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("id", { ascending: true });

  if (error) throw new Error(`getFeaturedProducts: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .order("id", { ascending: true })
    .limit(limit * 6);

  if (error) throw new Error(`getRelatedProducts: ${error.message}`);
  // One card per colour group, and never the colour group the shopper is already looking at.
  const seen = new Set<string>(product.groupKey ? [product.groupKey] : []);
  const related: Product[] = [];
  for (const row of data as ProductRow[]) {
    const item = mapRow(row);
    if (item.groupKey) {
      if (seen.has(item.groupKey)) continue;
      seen.add(item.groupKey);
    }
    related.push(item);
    if (related.length >= limit) break;
  }
  return related;
}

/**
 * Server-side text search (name/brand/category) via Postgres ILIKE. Used as
 * an async alternative to filtering an already-fetched product list —
 * client components like SearchBar instead fetch the full catalog once
 * and filter it in memory for instant-as-you-type results, since the demo
 * catalog is small; this function is here for API completeness and for any
 * future server-rendered search page.
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];

  const supabase = getSupabaseClient();
  const escaped = q.replace(/[%_]/g, "\\$&");
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${escaped}%,brand.ilike.%${escaped}%,category.ilike.%${escaped}%`)
    .order("id", { ascending: true });

  if (error) throw new Error(`searchProducts: ${error.message}`);
  return (data as ProductRow[]).map(mapRow);
}
