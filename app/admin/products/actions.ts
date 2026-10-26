"use server";

import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/admin-auth";
import { refreshStorefront, removeStoredImage, slugify } from "@/lib/admin-utils";

export interface ActionState {
  error: string | null;
}

const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg";

interface ParsedFields {
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  keyInfo: string[];
  price: number;
  salePrice: number | null;
  stock: number;
  sku: string;
  featured: boolean;
  image: string;
  gallery: string[];
  freeDelivery: boolean;
  /** "" (single watch), "__new__" (first colour of a new group) or an existing group key. Only used on create. */
  groupKey: string;
  groupName: string;
  variantLabel: string;
}

function parseProductFields(formData: FormData): ParsedFields {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const name = text("name");
  const slug = slugify(text("slug") || name);
  const keyInfoRaw = text("keyInfo");
  const price = Number(text("price"));
  const salePriceRaw = text("salePrice");
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null;
  const stock = Number(text("stock") || 0);
  const image = text("image");
  const gallery = formData.getAll("gallery").map((v) => String(v).trim()).filter(Boolean);

  if (!name) throw new Error("Product name is required.");
  if (!slug) throw new Error("Couldn't generate a URL slug. Check the product name.");
  if (!text("brand")) throw new Error("Brand is required.");
  if (!text("category")) throw new Error("Category is required.");
  if (!text("description")) throw new Error("Description is required.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Price must be a valid number, 0 or more.");
  if (salePrice != null && (!Number.isFinite(salePrice) || salePrice < 0)) {
    throw new Error("Sale price must be a valid number, 0 or more.");
  }
  if (salePrice != null && salePrice >= price) {
    throw new Error("Sale price must be lower than the regular price.");
  }
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number, 0 or more.");
  // Only allow our own relative paths or https URLs (blocks javascript:/data: URLs).
  if (image && !image.startsWith("/") && !/^https:\/\//i.test(image)) {
    throw new Error("Image must be an uploaded photo or an https:// link.");
  }
  const groupKey = text("groupKey");
  if (groupKey === "__new__" && !text("groupName")) throw new Error("Give the watch a name that all its colours share.");
  if (groupKey && !text("variantLabel")) throw new Error("Colour name is required for a colour option.");
  if (gallery.length > 8) throw new Error("You can add up to 8 extra photos.");
  if (gallery.some((g) => !g.startsWith("/") && !/^https:\/\//i.test(g))) {
    throw new Error("Extra photos must be uploaded photos or https:// links.");
  }

  return {
    name,
    slug,
    brand: text("brand"),
    category: text("category"),
    description: text("description"),
    keyInfo: keyInfoRaw ? keyInfoRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    price,
    salePrice,
    stock,
    sku: text("sku"),
    featured: formData.get("featured") === "on",
    image,
    gallery,
    freeDelivery: formData.get("freeDelivery") === "on",
    groupKey,
    groupName: text("groupName"),
    variantLabel: text("variantLabel"),
  };
}

function toRow(fields: ParsedFields) {
  return {
    name: fields.name,
    slug: fields.slug,
    brand: fields.brand,
    category: fields.category,
    description: fields.description,
    key_info: fields.keyInfo,
    price: fields.price,
    sale_price: fields.salePrice,
    image: fields.image || PLACEHOLDER_IMAGE,
    gallery: fields.gallery,
    free_delivery: fields.freeDelivery,
    stock: fields.stock,
    // Article number (WGA-xx) is assigned by the database on insert and never changed by edits.
    ...(fields.sku ? { sku: fields.sku } : {}),
    featured: fields.featured,
  };
}

function friendlyDbError(message: string): string {
  if (message.includes("products_slug_key")) {
    return "A product with that URL slug already exists. Choose a different name or slug.";
  }
  if (message.includes("products_category_fkey")) {
    return "That category doesn't exist. Pick one from the dropdown.";
  }
  if (message.includes("row-level security")) {
    return "This account isn't allowed to change products.";
  }
  return `Could not save product: ${message}`;
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, error: authError } = await requireAdminAction();
  if (!supabase) return { error: authError };

  let fields: ParsedFields;
  try {
    fields = parseProductFields(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input." };
  }

  // Colour groups: an existing group shares its model name; a new group uses the name typed in.
  let groupName: string | null = fields.groupName || null;
  if (fields.groupKey && fields.groupKey !== "__new__") {
    const { data: sibling } = await supabase
      .from("products")
      .select("group_name")
      .eq("group_key", fields.groupKey)
      .limit(1)
      .maybeSingle();
    if (!sibling) return { error: "That colour group no longer exists. Pick another or add this as a single watch." };
    groupName = (sibling.group_name as string | null) ?? null;
  }

  const { error } = await supabase.from("products").insert({
    ...toRow(fields),
    group_key: fields.groupKey || null,
    group_name: fields.groupKey ? groupName : null,
    variant_label: fields.groupKey ? fields.variantLabel : null,
    is_demo: false,
  });
  if (error) {
    console.error("[admin] createProduct:", error.message);
    return { error: friendlyDbError(error.message) };
  }

  refreshStorefront();
  redirect("/admin/products?saved=product-created");
}

export async function updateProduct(
  id: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, error: authError } = await requireAdminAction();
  if (!supabase) return { error: authError };

  let fields: ParsedFields;
  try {
    fields = parseProductFields(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input." };
  }

  const { data: existing } = await supabase
    .from("products")
    .select("image, gallery, group_key")
    .eq("id", id)
    .maybeSingle();

  // Editing a demo product turns it into a real one.
  const { error } = await supabase
    .from("products")
    .update({
      ...toRow(fields),
      // Colour name can be edited; the group itself and the article number never change here.
      ...(existing?.group_key ? { variant_label: fields.variantLabel || null } : {}),
      is_demo: false,
    })
    .eq("id", id);
  if (error) {
    console.error("[admin] updateProduct:", error.message);
    return { error: friendlyDbError(error.message) };
  }
  // The model name is shared by every colour in the group.
  if (existing?.group_key && fields.groupName) {
    await supabase.from("products").update({ group_name: fields.groupName }).eq("group_key", existing.group_key);
  }

  if (existing?.image && existing.image !== toRow(fields).image) {
    await removeStoredImage(supabase, existing.image);
  }
  for (const old of (existing?.gallery as string[] | null) ?? []) {
    if (!fields.gallery.includes(old)) await removeStoredImage(supabase, old);
  }

  refreshStorefront();
  redirect("/admin/products?saved=product-updated");
}

export async function deleteProduct(id: number): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdminAction();
  if (!supabase) return { error: authError };

  const { data: existing } = await supabase.from("products").select("image, gallery").eq("id", id).maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteProduct:", error.message);
    return { error: `Could not delete product: ${error.message}` };
  }

  await removeStoredImage(supabase, existing?.image);
  for (const g of (existing?.gallery as string[] | null) ?? []) await removeStoredImage(supabase, g);
  refreshStorefront();
  return { error: null };
}
