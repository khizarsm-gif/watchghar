import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import { getCategories } from "@/data/categories";
import { getAllProducts } from "@/data/products";
import { businessConfig } from "@/config/business";
import { collapseVariants } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${businessConfig.name} | Premium Watches in ${businessConfig.city}`,
  description: `${businessConfig.tagline}. Shop men's, women's and smart watches with doorstep delivery in ${businessConfig.city}.`,
  alternates: { canonical: "/" },
};

// Rebuild the cached homepage at most every 5 minutes (admin saves refresh it instantly).
export const revalidate = 300;

async function loadHomeData() {
  try {
    const [allProducts, categories] = await Promise.all([getAllProducts(), getCategories()]);
    return { allProducts, categories };
  } catch (err) {
    // Don't fail the build/page if Supabase is briefly unreachable.
    console.error("[home] Failed to load catalog:", err);
    return { allProducts: [], categories: [] };
  }
}

export default async function HomePage() {
  const { allProducts, categories } = await loadHomeData();
  const featuredProducts = allProducts.filter((p) => p.featured);
  const hasDemoProducts = featuredProducts.some((p) => p.isDemo);
  const collapsed = collapseVariants(allProducts);
  const countByCategory = collapsed.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  // One photo per category: the first watch in it.
  const imageByCategory = collapsed.reduce<Record<string, string>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = p.image;
    return acc;
  }, {});

  return (
    <>
      <Hero />
      <TrustBadges />

      <section id="categories" className="container-page py-14 sm:py-16">
        <div className="mb-10 text-center">
          <span className="eyebrow">Collections</span>
          <h2 className="mt-2 text-4xl font-semibold text-gray-900 sm:text-5xl">Shop by category</h2>
          <div className="gold-rule mt-4" />
          <p className="mt-4 text-sm text-gray-500">
            Find the watch that suits your wrist and your style.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 [&>*]:w-full sm:[&>*]:w-[calc(50%-0.75rem)] lg:[&>*]:w-[26rem]">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              count={countByCategory[category.slug] ?? 0}
              image={imageByCategory[category.slug]}
            />
          ))}
        </div>
      </section>

      <section className="bg-brand-50/70 py-14 sm:py-20">
        <div className="container-page">
          <div className="mb-10 text-center">
            <span className="eyebrow">Our selection</span>
            <h2 className="mt-2 text-4xl font-semibold text-gray-900 sm:text-5xl">Featured watches</h2>
            <div className="gold-rule mt-4" />
            <p className="mt-4 text-sm text-gray-500">
              Hand-picked favourites from our collection.
              {hasDemoProducts && (
                <span className="font-medium text-brand-700">
                  {" "}(Demo products, replace with real inventory)
                </span>
              )}
            </p>
          </div>
          <ProductGrid products={featuredProducts} />
          <div className="mt-10 flex justify-center">
            <Link href="/shop" className="btn-secondary !px-8 uppercase tracking-widest">
              View all watches
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-forest-900 p-10 text-center shadow-card-hover ring-1 ring-brand-600/40 sm:p-14">
          <span className="eyebrow !text-brand-400">Personal service</span>
          <h2 className="text-3xl font-semibold text-white sm:text-5xl">
            Need help choosing the right watch?
          </h2>
          <p className="max-w-xl text-sm text-brand-300 sm:text-base">
            Our team is ready to help over phone or WhatsApp, from
            sizing and straps to availability and delivery.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary uppercase tracking-widest">
              Contact Us
            </Link>
            <a
              href={`tel:${businessConfig.phoneRaw}`}
              className="btn-secondary !text-brand-300 !ring-brand-400/60 hover:!bg-white/10"
            >
              Call {businessConfig.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
