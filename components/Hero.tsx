import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";

// Three of our own product photos, shown in arched frames.
const tiles = [
  { src: "/images/products/fttpon-twotone-champagne.jpg", alt: "Two-tone watch with a champagne dial", offset: "mt-10" },
  { src: "/images/products/viokai-fluted-gold-black.jpg", alt: "Gold watch with a black dial", offset: "mt-0" },
  { src: "/images/products/fttpon-twotone-blue.jpg", alt: "Two-tone watch with a blue dial", offset: "mt-16" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-page to-page">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-300/25 blur-3xl"
      />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <span className="eyebrow">New collection &middot; Free delivery</span>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] text-gray-900 sm:text-6xl lg:text-7xl">
            Timeless watches,
            <span className="block italic text-brand-700">made to be worn.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Classic dress watches, bold two-tones and elegant ladies&apos; pieces, each one
            chosen with care and delivered to your door in a free gift box.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/shop" className="btn-primary !px-8 !py-3.5 uppercase tracking-widest">
              Shop the collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn-secondary !px-7 !py-3.5 uppercase tracking-widest">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Contact us
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5" aria-hidden="false">
          {tiles.map((t) => (
            <div
              key={t.src}
              className={`relative aspect-[3/5] overflow-hidden rounded-t-full rounded-b-2xl bg-brand-100 shadow-card-hover ring-1 ring-brand-300/60 ${t.offset}`}
            >
              <Image
                src={t.src}
                alt={t.alt}
                fill
                priority
                sizes="(max-width: 1024px) 30vw, 18vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
