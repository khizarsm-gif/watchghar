import { ShieldCheck, Gift, Truck, MessageCircle } from "lucide-react";

const items = [
  { icon: Truck, title: "Free Delivery", text: "Straight to your door" },
  { icon: Gift, title: "Free Gift Box", text: "Ready to present" },
  { icon: ShieldCheck, title: "Carefully Curated", text: "Every piece inspected" },
  { icon: MessageCircle, title: "WhatsApp Support", text: "Quick, friendly help" },
];

export default function TrustBadges() {
  return (
    <section className="border-b border-brand-200/60 bg-surface">
      <div className="container-page grid grid-cols-2 sm:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <div
            key={title}
            className={`flex items-center justify-center gap-3 px-3 py-6 sm:py-7 ${
              i > 0 ? "sm:border-l sm:border-brand-200/70" : ""
            } ${i % 2 === 1 ? "border-l border-brand-200/70 sm:border-l" : ""}`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-300/60">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-snug">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-900">{title}</span>
              <span className="text-xs text-gray-500">{text}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
