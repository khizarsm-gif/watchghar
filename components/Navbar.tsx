"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, MessageCircle, Watch, Search } from "lucide-react";
import { businessConfig } from "@/config/business";
import { useCart } from "@/lib/cart-context";
import SearchBar from "@/components/SearchBar";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-200/60 bg-surface/95 backdrop-blur">
      <div className="bg-brand-950 px-4 py-1.5 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-brand-300 sm:text-[11px] sm:tracking-[0.2em]">
        Free delivery &amp; free gift box on every watch
      </div>
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-sm ring-2 ring-brand-200">
            <Watch className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold uppercase tracking-[0.18em] text-gray-900 sm:text-2xl">
              {businessConfig.name}
            </span>
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.3em] text-brand-700 sm:block">
              Fine watches &middot; {businessConfig.city}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <SearchBar className="max-w-xs" />
          <button
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative rounded-full p-2.5 text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-ink">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
          <a
            href={buildWhatsAppContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp !px-4 !py-2.5 text-sm"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
            className="rounded-full p-2.5 text-gray-700 hover:bg-brand-50"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative rounded-full p-2.5 text-gray-700 hover:bg-brand-50"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-ink">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="rounded-full p-2.5 text-gray-700 hover:bg-brand-50"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-brand-200/50 px-4 py-3 md:hidden">
          <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col gap-1 border-t border-brand-200/50 px-4 py-3 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={buildWhatsAppContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="btn-whatsapp mt-2 w-full"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp Us
          </a>
        </nav>
      )}
    </header>
  );
}
