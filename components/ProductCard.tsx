"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, isOnSale, calculateDiscountPercent } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useToast } from "@/lib/toast-context";
import { useCatalog } from "@/lib/catalog-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { getCategory, products } = useCatalog();

  const onSale = isOnSale(product.price, product.salePrice);
  const discount = calculateDiscountPercent(product.price, product.salePrice);
  const category = getCategory(product.category);
  const wishlisted = isWishlisted(product.id);
  // Colour groups show as one card: model name, group article number and the number of colours.
  const siblings = product.groupKey ? products.filter((p) => p.groupKey === product.groupKey) : [];
  const colourCount = siblings.length;
  const isGroup = colourCount > 1;
  const title = isGroup ? product.groupName ?? product.name : product.name;
  const articleLabel = isGroup ? product.groupKey : product.sku;
  // A colour group is only "out of stock" when every colour is.
  const outOfStock = isGroup ? siblings.every((p) => p.stock <= 0) : product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product, 1);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-brand-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:ring-brand-400/50">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-50">
        <Link href={`/products/${product.slug}`} className="block h-full w-full" aria-label={title}>
          <Image
            src={product.image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {onSale && <span className="badge bg-red-600 text-white shadow">-{discount}%</span>}
          {product.isDemo && <span className="badge bg-gray-900/80 text-white">Demo</span>}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur transition-colors hover:text-red-500"
        >
          <Heart
            className="h-4 w-4"
            aria-hidden="true"
            fill={wishlisted ? "currentColor" : "none"}
            color={wishlisted ? "#ef4444" : "currentColor"}
          />
        </button>

        {articleLabel && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-gray-900 shadow-sm ring-1 ring-brand-300/60 backdrop-blur">
            {articleLabel}
          </span>
        )}

        {isGroup && (
          <span className="absolute bottom-3 right-3 rounded-full bg-gray-900/85 px-3 py-1 text-[11px] font-medium tracking-wide text-brand-200 shadow-sm backdrop-blur">
            {colourCount} colours
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="badge bg-gray-900 text-white">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          {product.brand || category?.name}
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 font-display text-lg font-semibold leading-snug text-gray-900 transition-colors hover:text-brand-700 sm:text-xl"
        >
          {title}
        </Link>

        <div className="mt-1 flex items-center justify-center gap-2">
          {onSale ? (
            <>
              <span className="text-base font-semibold text-brand-800">
                {formatPrice(product.salePrice as number)}
              </span>
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-base font-semibold text-brand-800">{formatPrice(product.price)}</span>
          )}
        </div>

        {product.freeDelivery && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
            Free delivery + free box
          </span>
        )}

        <div className="mt-auto pt-4">
          {isGroup ? (
            <Link
              href={`/products/${product.slug}`}
              className="btn-secondary w-full !py-2.5 text-xs uppercase tracking-widest group-hover:bg-brand-50"
            >
              Choose colour
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-secondary w-full !py-2.5 text-xs uppercase tracking-widest hover:!bg-brand-600 hover:!text-ink"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
