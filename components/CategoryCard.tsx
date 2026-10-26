import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

export default function CategoryCard({
  category,
  count,
  image,
}: {
  category: Category;
  count: number;
  /** Photo of one watch from this category. */
  image?: string;
}) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group flex h-44 overflow-hidden rounded-2xl bg-forest-900 shadow-card ring-1 ring-brand-600/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:ring-brand-400/70 sm:h-52"
    >
      <span className="relative w-1/2 overflow-hidden bg-forest-800">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </span>
      <span className="flex w-1/2 flex-col items-start justify-center gap-2 p-4 sm:p-5">
        <span className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
          {category.name}
        </span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-brand-300">
          {count} {count === 1 ? "design" : "designs"}
        </span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-brand-400 transition-all group-hover:gap-2">
          Explore <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
