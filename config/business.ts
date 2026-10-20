/**
 * ============================================================================
 * CENTRAL BUSINESS CONFIGURATION
 * ============================================================================
 * This is the ONE file you need to edit to update store information
 * across the entire website: name, contact details, address, hours,
 * delivery fee, currency, and social links.
 *
 * Nothing else in the codebase should hardcode this information — every
 * component/page imports it from here. Update the values below and the
 * whole site (header, footer, contact page, WhatsApp messages, checkout,
 * SEO metadata, etc.) updates automatically.
 * ============================================================================
 */

export const businessConfig = {
  name: "Watch Ghar",
  tagline: "Timeless Watches, Delivered to Your Door",
  legalName: "Watch Ghar",

  // Used in SEO titles like "Watch Ghar | Premium Watches in Lahore".
  // ASSUMPTION: Lahore / Pakistan (PKR pricing). Change if the store is elsewhere.
  city: "Lahore",
  country: "Pakistan",

  // --- Contact information -------------------------------------------------
  phone: "+92 315 9355554",
  // Raw digits only (no +, spaces, or dashes) — used to build tel:/wa.me links.
  phoneRaw: "923159355554",
  whatsapp: "+92 315 9355554",
  // Raw digits only, international format, no leading + — required by wa.me links.
  whatsappRaw: "923159355554",
  // Interim contact email. Replace with a business-domain address once one exists.
  email: "khizarsm@gmail.com",

  // --- Location --------------------------------------------------------------
  address: "Shop 113, Pak Market, Shah Alam Market, Lahore, Pakistan",
  // Map on the Contact page, built from the address (no API key needed).
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Shop+113,+Pak+Market,+Shah+Alam+Market,+Lahore,+Pakistan&output=embed",
  googleMapsDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Shop+113,+Pak+Market,+Shah+Alam+Market,+Lahore,+Pakistan",

  // --- Hours (PLACEHOLDER: confirm with the owner) -----------------------------------------------
  openingHours: "Monday – Saturday: 11:00 AM – 9:00 PM",
  openingHoursDetailed: [
    { days: "Monday – Saturday", hours: "11:00 AM – 9:00 PM" },
    { days: "Sunday", hours: "Closed" },
  ],

  // --- Commerce ------------------------------------------------------------
  currency: "PKR",
  currencySymbol: "PKR",
  // Flat delivery fee, waived once the subtotal reaches the threshold.
  deliveryFee: 300,
  freeDeliveryThreshold: 15000,

  // --- Social links (leave blank string to hide an icon in the footer) ----
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
  },

  // --- Misc ------------------------------------------------------------------
  disclaimer:
    "Product images are for illustration. Specifications and availability are confirmed by our team when your order is placed.",
} as const;

export type BusinessConfig = typeof businessConfig;
