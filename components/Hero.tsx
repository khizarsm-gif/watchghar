"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

// Slides use our own product photos. Update the text or links here to change the banner.
const slides = [
  {
    eyebrow: "New collection · Free delivery",
    title: "Timeless watches,",
    accent: "made to be worn.",
    text: "Classic dress watches, bold two-tones and elegant ladies’ pieces, each one chosen with care and delivered to your door in a free gift box.",
    image: "/images/products/fttpon-twotone-champagne.jpg",
    alt: "Two-tone watch with a champagne dial",
    cta: { href: "/shop", label: "Shop the collection" },
  },
  {
    eyebrow: "Gold edit",
    title: "Gold, refined",
    accent: "for every occasion.",
    text: "Fluted-bezel gold pieces that catch the light and finish any outfit.",
    image: "/images/products/viokai-fluted-gold-black.jpg",
    alt: "Gold watch with a black dial and fluted bezel",
    cta: { href: "/products/viokai-fluted-gold-black", label: "View this watch" },
  },
  {
    eyebrow: "Everyday elegance",
    title: "Day and date,",
    accent: "always in style.",
    text: "Two-tone day-date watches in champagne, white and black dials.",
    image: "/images/products/aone-dot-twotone-champagne.jpg",
    alt: "Two-tone day-date watch with a champagne dial",
    cta: { href: "/products/aone-dot-twotone-champagne", label: "View this watch" },
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden bg-forest-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured watches"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 h-full w-2/3 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.22),transparent_65%)]"
      />
      {slides.map((s, i) => (
        <div
          key={s.title}
          aria-hidden={i !== index}
          className={`transition-opacity duration-700 ${
            i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
          }`}
        >
          <div className="container-page relative grid min-h-[460px] grid-cols-1 items-center gap-6 py-10 sm:py-14 lg:grid-cols-2 lg:gap-10 lg:py-16">
            <div className="order-2 flex flex-col items-start gap-5 lg:order-1 lg:pl-8">
              <span className="eyebrow !text-brand-400">{s.eyebrow}</span>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] text-white sm:text-6xl">
                {s.title}
                <span className="block italic text-brand-400">{s.accent}</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-white/75 sm:text-base">{s.text}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href={s.cta.href} className="btn-primary !px-7 !py-3 text-xs uppercase tracking-widest">
                  {s.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="btn !px-7 !py-3 text-xs uppercase tracking-widest text-white ring-1 ring-inset ring-white/40 hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Contact us
                </Link>
              </div>
            </div>

            <div className="order-1 mx-auto w-full max-w-[14rem] sm:max-w-xs lg:order-2 lg:max-w-md">
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl shadow-2xl ring-1 ring-brand-500/50">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 80vw, 28rem"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/25"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/25"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-brand-400" : "w-2 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
}
