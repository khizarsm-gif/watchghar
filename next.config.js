/** @type {import('next').NextConfig} */

// Product photos live in Supabase Storage for THIS store's project. The host
// is derived from NEXT_PUBLIC_SUPABASE_URL so no project id is hardcoded.
function supabaseHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
  } catch {
    return null;
  }
}
const host = supabaseHost();

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Demo images are local SVGs in /public, served as-is (unoptimized) to
    // avoid the optimizer's SVG CSP header. Real product photos come from
    // Supabase Storage by public URL. With `unoptimized` on, Next does not
    // check remotePatterns; it is kept for the case it is turned back on.
    unoptimized: true,
    remotePatterns: host
      ? [{ protocol: "https", hostname: host, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

module.exports = nextConfig;
