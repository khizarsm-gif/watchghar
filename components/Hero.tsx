import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-950/60 to-transparent">
      <div className="container-page grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col items-start gap-5">
          <span className="badge bg-brand-600/15 text-brand-300 ring-1 ring-brand-600/40">
            New arrivals &bull; Doorstep delivery
          </span>
          <h1 className="font-display text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Timeless Watches, <span className="text-brand-500">Made to Be Worn</span>
          </h1>
          <p className="max-w-xl text-base text-gray-600 sm:text-lg">
            Discover classic dress watches, rugged sports pieces, and modern
            smartwatches. Order online and we deliver to your door.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/shop" className="btn-primary">
              Shop Watches
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn-secondary">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Contact Us
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-card-hover ring-1 ring-brand-600/30">
          <Image
            src="/images/hero.svg"
            alt="A gold wristwatch on a dark background"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
