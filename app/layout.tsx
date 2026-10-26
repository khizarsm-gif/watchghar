import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import Providers from "@/components/Providers";
import SiteChrome from "@/components/SiteChrome";
import { businessConfig } from "@/config/business";
import { getAllProducts } from "@/data/products";
import { getCategories } from "@/data/categories";
import type { Category, Product } from "@/types";
import { siteUrl } from "@/lib/site-url";


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${businessConfig.name} | Premium Watches in ${businessConfig.city}`,
    template: `%s | ${businessConfig.name}`,
  },
  description: `${businessConfig.tagline}. Shop men's, women's and smart watches from ${businessConfig.name} in ${businessConfig.city}, ${businessConfig.country}.`,
  keywords: [
    "watches",
    businessConfig.city,
    "online watch store",
    "men's watches",
    "smartwatches",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: businessConfig.name,
    title: `${businessConfig.name} | Premium Watches in ${businessConfig.city}`,
    description: businessConfig.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${businessConfig.name} | Premium Watches in ${businessConfig.city}`,
    description: businessConfig.tagline,
  },
};

/**
 * Loads the catalog once per render (cached, see lib/supabase.ts) for client
 * components like search and the cart. If Supabase is unreachable the site
 * still renders with an empty catalog instead of crashing.
 */
async function loadCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  try {
    const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
    return { products, categories };
  } catch (err) {
    console.error("[layout] Failed to load catalog from Supabase:", err);
    return { products: [], categories: [] };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { products, categories } = await loadCatalog();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-page font-sans text-gray-900">
        <Providers products={products} categories={categories}>
          <SiteChrome
            header={<Navbar />}
            footer={
              <>
                <Footer categories={categories} />
                <CartDrawer />
                <WhatsAppButton variant="floating" />
                <BackToTop />
              </>
            }
          >
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
