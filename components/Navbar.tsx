"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, MessageCircle, Watch, Search, Hexagon } from "lucide-react";
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

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-ink">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : href.startsWith("/#") ? false : pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-brand-600/30 bg-forest-900/95 text-white backdrop-blur">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center text-brand-400">
            <Hexagon className="absolute h-11 w-11" strokeWidth={1.2} aria-hidden="true" />
            <Watch className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold uppercase tracking-[0.2em] text-white sm:text-2xl">
              {businessConfig.name}
            </span>
            <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.3em] text-brand-400 sm:block">
              Fine watches &middot; {businessConfig.city}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:text-brand-300 ${
                isActive(link.href) ? "border-brand-400 text-white" : "border-transparent text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <SearchBar tone="dark" className="max-w-xs" />
          <button
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative rounded-full p-2.5 text-white/90 hover:bg-white/10 hover:text-brand-300"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <CartBadge count={itemCount} />
          </button>
          <a
            href={buildWhatsAppContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !px-4 !py-2.5 text-xs"
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
            className="rounded-full p-2.5 text-white/90 hover:bg-white/10"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative rounded-full p-2.5 text-white/90 hover:bg-white/10"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <CartBadge count={itemCount} />
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="rounded-full p-2.5 text-white/90 hover:bg-white/10"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-brand-600/30 px-4 py-3 md:hidden">
          <SearchBar tone="dark" autoFocus onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col gap-1 border-t border-brand-600/30 px-4 py-3 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white/90 hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={buildWhatsAppContactUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="btn-primary mt-2 w-full"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp Us
          </a>
        </nav>
      )}
    </header>
  );
}
