"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, MessageCircle, Phone, Heart, ZoomIn, Truck, Gift, ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Category, Product } from "@/types";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGrid from "@/components/ProductGrid";
import QuantitySelector from "@/components/QuantitySelector";
import ImageLightbox from "@/components/ImageLightbox";
import { formatPrice, isOnSale, calculateDiscountPercent } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useCatalog } from "@/lib/catalog-context";
import { buildTelUrl, buildWhatsAppContactUrl } from "@/lib/whatsapp";
import { businessConfig } from "@/config/business";

/** Sort key for article numbers like WGA-08d: number first, then the colour letter. */
function articleOrder(sku: string): [number, string] {
  const m = /^WGA-(\d+)([a-z]*)$/i.exec(sku ?? "");
  return m ? [Number(m[1]), m[2].toLowerCase()] : [Number.MAX_SAFE_INTEGER, sku ?? ""];
}

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
  const [tab, setTab] = useState<"overview" | "specs" | "delivery">("overview");
  const hasColours = variants.length > 1;
  const heading = hasColours ? product.groupName ?? product.name : product.name;
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { products: catalog } = useCatalog();

  // Every article in article-number order, so the arrows under the photo step to the previous / next one.
  const articles = useMemo(
    () =>
      [...catalog]
        .filter((p) => p.sku)
        .sort((a, b) => {
          const [an, as] = articleOrder(a.sku);
          const [bn, bs] = articleOrder(b.sku);
          return an - bn || as.localeCompare(bs);
        }),
    [catalog]
  );
  const articleIndex = articles.findIndex((p) => p.id === product.id);
  const prevArticle =
    articles.length > 1 && articleIndex >= 0
      ? articles[(articleIndex - 1 + articles.length) % articles.length]
      : undefined;
  const nextArticle =
    articles.length > 1 && articleIndex >= 0 ? articles[(articleIndex + 1) % articles.length] : undefined;
  const { isWishlisted, toggleWishlist } = useWishlist();

  const onSale = isOnSale(product.price, product.salePrice);
  const discount = calculateDiscountPercent(product.price, product.salePrice);
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`${quantity} × ${product.name} added to cart`);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "specs", label: "Specifications" },
    { id: "delivery", label: "Delivery" },
  ] as const;

  const goPhoto = (delta: number) => setActivePhoto((i) => (i + delta + photos.length) % photos.length);

  return (
    <div className="container-page pb-16">
      <Breadcrumbs
        items={[
          ...(category
            ? [{ label: category.name, href: `/shop?category=${category.slug}` }]
            : []),
          { label: hasColours ? `${heading} (${product.sku})` : product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)] xl:gap-10">
        {/* Photos */}
        <div>
          <div className="flex gap-3">
            {photos.length > 1 && (
              <div className="hidden max-h-[640px] w-[72px] shrink-0 flex-col gap-2 overflow-y-auto sm:flex">
                {photos.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    aria-label={`Show photo ${i + 1} of ${photos.length}`}
                    aria-current={i === activePhoto}
                    className={`relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-lg bg-brand-50 ring-2 transition-shadow ${
                      i === activePhoto ? "ring-brand-600" : "ring-transparent hover:ring-brand-300"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="72px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

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
              className="relative aspect-[4/5] min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-brand-50 shadow-card ring-1 ring-brand-300/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <Image
                key={photos[activePhoto]}
                src={photos[activePhoto]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className={activePhoto === 0 ? "object-cover" : "object-contain"}
              />
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                {onSale && <span className="badge bg-red-600 text-white">-{discount}%</span>}
                {product.isDemo && <span className="badge bg-gray-900/80 text-white">Demo Product</span>}
              </div>

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPhoto(-1);
                    }}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-forest-900/70 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-forest-900"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPhoto(1);
                    }}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-forest-900/70 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-forest-900"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              )}

              {product.sku && (
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold tracking-[0.14em] text-gray-900 shadow-sm ring-1 ring-brand-300/60 backdrop-blur">
                  {product.sku}
                </span>
              )}
              <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-forest-900/80 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                View larger
              </span>
            </div>
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
            <div className="mt-3 grid grid-cols-5 gap-2 sm:hidden">
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

          {prevArticle && nextArticle && (
            <nav
              aria-label="Browse articles"
              className="mt-4 flex items-center justify-between gap-2 rounded-full bg-surface px-2 py-2 shadow-card ring-1 ring-brand-300/50"
            >
              <Link
                href={`/products/${prevArticle.slug}`}
                scroll={false}
                aria-label={`Previous article, ${prevArticle.sku}`}
                className="group flex items-center gap-1 rounded-full py-2 pl-2 pr-4 text-sm font-semibold tracking-wide text-gray-800 transition-colors hover:bg-brand-50 hover:text-brand-800"
              >
                <ChevronLeft className="h-5 w-5 text-brand-700 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                <span className="hidden sm:inline">{prevArticle.sku}</span>
                <span className="sm:hidden">Prev</span>
              </Link>
              <span className="text-center text-xs uppercase tracking-[0.2em] text-gray-500">
                <span className="font-semibold text-gray-900">{product.sku}</span>
                <span className="mx-2 text-brand-500">&middot;</span>
                {articleIndex + 1} of {articles.length}
              </span>
              <Link
                href={`/products/${nextArticle.slug}`}
                scroll={false}
                aria-label={`Next article, ${nextArticle.sku}`}
                className="group flex items-center gap-1 rounded-full py-2 pl-4 pr-2 text-sm font-semibold tracking-wide text-gray-800 transition-colors hover:bg-brand-50 hover:text-brand-800"
              >
                <span className="hidden sm:inline">{nextArticle.sku}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-5 w-5 text-brand-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </nav>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {category && (
            <Link
              href={`/shop?category=${category.slug}`}
              className="eyebrow w-fit hover:underline"
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">{heading}</h1>

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
                      <span className="absolute bottom-0 right-0 rounded-tl bg-forest-900/90 px-1.5 text-[11px] font-bold uppercase text-white">
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
              Article No.: <span className="font-bold tracking-wide text-brand-700">{product.sku}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onSale ? (
              <>
                <span className="font-display text-4xl font-semibold text-brand-800">
                  {formatPrice(product.salePrice as number)}
                </span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-display text-4xl font-semibold text-brand-800">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div>
            {outOfStock ? (
              <span className="badge bg-gray-200 text-gray-700">Out of Stock</span>
            ) : (
              <span className="badge bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">In Stock</span>
            )}
          </div>

          {product.freeDelivery && (
            <p className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
              <Truck className="h-4 w-4" aria-hidden="true" />
              Free delivery and a free gift box included
            </p>
          )}

          <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="label !mb-0">Quantity</span>
              <QuantitySelector quantity={quantity} onChange={setQuantity} max={Math.max(product.stock, 1)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="btn-dark flex-1 sm:flex-none sm:px-8"
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
        </div>

        {/* Side panel */}
        <aside className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1">
          {product.keyInfo && product.keyInfo.length > 0 && (
            <div className="card flex flex-col gap-3 p-5">
              <h2 className="font-display text-xl font-semibold text-gray-900">Specifications</h2>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {product.keyInfo.map((info, idx) => (
                  <li key={idx} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card divide-y divide-brand-200/60">
            {product.freeDelivery && (
              <>
                <div className="flex items-center gap-3 p-4">
                  <Truck className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Free delivery</p>
                    <p className="text-xs text-gray-500">Straight to your door</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <Gift className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Free gift box</p>
                    <p className="text-xs text-gray-500">Ready to present</p>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center gap-3 p-4">
              <MessageCircle className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">WhatsApp support</p>
                <p className="text-xs text-gray-500">Ask us anything about this watch</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Tabs */}
      <section className="mt-12">
        <div role="tablist" aria-label="Watch information" className="flex gap-6 border-b border-brand-200/70">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                tab === t.id ? "border-brand-600 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="max-w-3xl py-6 text-sm leading-relaxed text-gray-600"
        >
          {tab === "overview" && (
            <div className="space-y-3">
              <p>{product.description}</p>
              <p>
                Article No. <span className="font-semibold text-gray-900">{product.sku}</span>
                {hasColours && product.variantLabel ? <> &middot; {product.variantLabel}</> : null}
              </p>
            </div>
          )}
          {tab === "specs" && (
            <ul className="space-y-2">
              <li>
                Brand: <span className="font-medium text-gray-900">{product.brand}</span>
              </li>
              {(product.keyInfo ?? [])
                .filter((info) => !info.toLowerCase().startsWith("brand:"))
                .map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
            </ul>
          )}
          {tab === "delivery" && (
            <div className="space-y-3">
              {product.freeDelivery ? (
                <p>This watch ships with free delivery and a free gift box.</p>
              ) : (
                <p>
                  Delivery is {formatPrice(businessConfig.deliveryFee)}, and free on orders of{" "}
                  {formatPrice(businessConfig.freeDeliveryThreshold)} or more. You can also collect from our store.
                </p>
              )}
              <p>Pay by cash on delivery, or pay at the store when you collect.</p>
              <p>{businessConfig.disclaimer}</p>
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="mb-10 text-center">
            <span className="eyebrow">You may also like</span>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">Related watches</h2>
            <div className="gold-rule mt-4" />
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
