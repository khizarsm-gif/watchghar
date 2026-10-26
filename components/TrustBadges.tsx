import { ShieldCheck, Gift, Truck, MessageCircle } from "lucide-react";

const items = [
  { icon: Truck, title: "Free Delivery", text: "Straight to your door" },
  { icon: Gift, title: "Free Gift Box", text: "Ready to present" },
  { icon: ShieldCheck, title: "Carefully Curated", text: "Every piece inspected" },
  { icon: MessageCircle, title: "WhatsApp Support", text: "Quick, friendly help" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-200/60 bg-surface">
      <div className="container-page grid grid-cols-2 gap-6 py-7 sm:grid-cols-4 sm:py-9">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-300/60">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-900">{title}</span>
            <span className="text-xs text-gray-500">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
