import Link from "next/link";
import type { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";

export default function CategoryCard({ category, count }: { category: Category; count: number }) {
  const Icon = getCategoryIcon(category.icon);

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center shadow-card ring-1 ring-brand-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:ring-brand-400/60 sm:p-8"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-300/60 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-semibold text-gray-900 sm:text-2xl">
        {category.name}
      </span>
      <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
        {count} {count === 1 ? "design" : "designs"}
      </span>
    </Link>
  );
}
