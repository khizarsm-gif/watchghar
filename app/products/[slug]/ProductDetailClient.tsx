"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, MessageCircle, Phone, Heart, Package, ZoomIn, Truck } from "lucide-react";
import type { Category, Product } from "@/types";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGrid from "@/components/ProductGrid";
import QuantitySelector from "@/components/QuantitySelector";
import ImageLightbox from "@/components/ImageLightbox";
import { formatPrice, isOnSale, calculateDiscountPercent } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useWishlist } from "@/lib/wishlist-context";
import { buildTelUrl, buildWhatsAppContactUrl } from "@/lib/whatsapp";
import { businessConfig } from "@/config/business";

interface ProductDetailClientProps {
  product: Product;
  category?: Category;
  relatedProducts: Product[];
  /** Every colour of this watch (just this product when it has no colour group). */
  variants: Product[];
}

export default function ProductDetailClient({
  product,
  category,
  relatedProducts,
  variants,
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const photos = [product.image, ...(product.gallery ?? [])];
  const [activePhoto, setActivePhoto] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const hasColours = variants.length > 1;
  const heading = hasColours ? product.groupName ?? product.name : product.name;
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const onSale = isOnSale(product.price, product.salePrice);
  const discount = calculateDiscountPercent(product.price, product.salePrice);
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`${quantity} × ${product.name} added to cart`);
  };

  return (
    <div className="container-page pb-16">
      <Breadcrumbs
        items={[
          ...(category
            ? [{ label: category.name, href: `/shop?category=${category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Open photo to zoom"
            onClick={() => setZoomOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setZoomOpen(true);
              }
            }}
            className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <Image
              key={photos[activePhoto]}
              src={photos[activePhoto]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={activePhoto === 0 ? "object-cover" : "object-contain"}
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {onSale && <span className="badge bg-red-600 text-white">-{discount}%</span>}
              {product.isDemo && <span className="badge bg-black/70 text-white">Demo Product</span>}
            </div>
            {product.sku && (
              <span className="absolute bottom-3 left-3 rounded bg-black/80 px-3 py-1.5 text-sm font-bold tracking-wider text-white shadow-md ring-1 ring-white/30">
                {product.sku}
              </span>
            )}
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
              <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
              Click to zoom
            </span>
          </div>

          {zoomOpen && (
            <ImageLightbox
              images={photos}
              startIndex={activePhoto}
              alt={product.name}
              onClose={() => setZoomOpen(false)}
            />
          )}

          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Show photo ${i + 1} of ${photos.length}`}
                  aria-current={i === activePhoto}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-brand-50 ring-2 transition-shadow ${
                    i === activePhoto ? "ring-brand-600" : "ring-transparent hover:ring-brand-300"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {category && (
            <Link
              href={`/shop?category=${category.slug}`}
              className="w-fit text-xs font-semibold uppercase tracking-wide text-brand-600 hover:underline"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{heading}</h1>

          {hasColours && (
            <div>
              <p className="mb-2 text-sm text-gray-500">
                Colour: <span className="font-medium text-gray-700">{product.variantLabel}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const active = v.id === product.id;
                  return (
                    <Link
                      key={v.id}
                      href={`/products/${v.slug}`}
                      scroll={false}
                      aria-label={`${v.variantLabel ?? v.name}, article ${v.sku}`}
                      aria-current={active}
                      title={`${v.variantLabel ?? v.name} (${v.sku})`}
                      className={`relative block h-16 w-16 overflow-hidden rounded-lg bg-brand-50 ring-2 transition-shadow ${
                        active ? "ring-brand-600" : "ring-transparent hover:ring-brand-300"
                      }${v.stock <= 0 ? " opacity-50" : ""}`}
                    >
                      <Image src={v.image} alt="" fill sizes="64px" className="object-cover" />
                      <span className="absolute bottom-0 right-0 rounded-tl bg-black/80 px-1.5 text-[11px] font-bold uppercase text-white">
                        {v.sku.slice(v.groupKey?.length ?? 0)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span>
              Brand: <span className="font-medium text-gray-700">{product.brand}</span>
            </span>
            <span>
              Article No.: <span className="font-bold tracking-wide text-brand-600">{product.sku}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onSale ? (
              <>
                <span className="text-3xl font-bold text-brand-800">
                  {formatPrice(product.salePrice as number)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-brand-800">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div>
            {outOfStock ? (
              <span className="badge bg-gray-200 text-gray-700">Out of Stock</span>
            ) : (
              <span className="badge bg-brand-100 text-brand-700">In Stock</span>
            )}
          </div>

          {product.freeDelivery && (
            <p className="inline-flex w-fit items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-500">
              <Truck className="h-4 w-4" aria-hidden="true" />
              Free delivery and a free gift box included
            </p>
          )}

          <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>

                      <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="label !mb-0">Quantity</span>
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  max={Math.max(product.stock, 1)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="btn-primary flex-1 sm:flex-none sm:px-8"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-pressed={wishlisted}
                  className="btn-secondary"
                >
                  <Heart
                    className="h-4 w-4"
                    aria-hidden="true"
                    fill={wishlisted ? "currentColor" : "none"}
                    color={wishlisted ? "#ef4444" : "currentColor"}
                  />
                  {wishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>
            </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={buildWhatsAppContactUrl(
                `Hello ${businessConfig.name}, I would like to ask about ${product.name} (Article No. ${product.sku}).`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask on WhatsApp
            </a>
            <a href={buildTelUrl()} className="btn-secondary">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call Us
            </a>
          </div>

          {product.keyInfo && product.keyInfo.length > 0 && (
            <div className="card flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2 text-gray-800">
                <Package className="h-4 w-4 shrink-0" aria-hidden="true" />
                <h2 className="text-sm font-semibold">Specifications</h2>
              </div>
              <ul className="ml-6 list-disc space-y-1 text-sm text-gray-600">
                {product.keyInfo.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="border-t border-gray-100 pt-4 text-xs text-gray-400">
            {businessConfig.disclaimer}
          </p>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
            Related Products
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
