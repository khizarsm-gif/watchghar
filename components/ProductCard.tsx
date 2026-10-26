"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
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
  const colourCount = product.groupKey
    ? products.filter((p) => p.groupKey === product.groupKey).length
    : 0;
  const isGroup = colourCount > 1;
  const title = isGroup ? product.groupName ?? product.name : product.name;
  const articleLabel = isGroup ? product.groupKey : product.sku;
  // A colour group is only "out of stock" when every colour is.
  const outOfStock = isGroup
    ? products.filter((p) => p.groupKey === product.groupKey).every((p) => p.stock <= 0)
    : product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product, 1);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-square w-full overflow-hidden bg-brand-50">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {onSale && (
            <span className="badge bg-red-600 text-white">-{discount}%</span>
          )}
          {product.isDemo && (
            <span className="badge bg-black/70 text-white">Demo</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-gray-700 shadow-sm transition-colors hover:text-red-500"
        >
          <Heart
            className="h-4 w-4"
            aria-hidden="true"
            fill={wishlisted ? "currentColor" : "none"}
            color={wishlisted ? "#ef4444" : "currentColor"}
          />
        </button>

        {articleLabel && (
          <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2.5 py-1 text-xs font-bold tracking-wider text-white shadow-md ring-1 ring-white/30">
            {articleLabel}
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="badge bg-black/80 text-white">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {category && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {category.name}
          </span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-brand-700 sm:text-base"
        >
          {title}
        </Link>
        <span className="text-xs text-gray-500">{product.brand}</span>
        {product.sku && (
          <span className="text-xs font-semibold tracking-wide text-brand-600">
            Article No. {articleLabel}
          </span>
        )}
        {isGroup && (
          <span className="text-xs font-medium text-gray-700">{colourCount} colours available</span>
        )}

        <div className="mt-1 flex items-center gap-2">
          {onSale ? (
            <>
              <span className="text-base font-bold text-brand-800">
                {formatPrice(product.salePrice as number)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-brand-800">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {product.freeDelivery && (
          <span className="text-xs font-semibold text-green-500">Free delivery + free box</span>
        )}

        <div className="mt-auto pt-3">
          {isGroup ? (
            <Link
              href={`/products/${product.slug}`}
              className="btn-primary w-full !py-2 text-xs sm:text-sm"
            >
              Choose colour
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-primary w-full !py-2 text-xs sm:text-sm"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
