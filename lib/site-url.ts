/**
 * Public site URL used for SEO metadata, the sitemap and robots.txt.
 * Set NEXT_PUBLIC_SITE_URL in Vercel once the real domain exists.
 * The fallback is a placeholder on a reserved domain, never a real site.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://watchghar.example.com").replace(/\/$/, "");
