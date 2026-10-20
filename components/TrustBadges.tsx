import { ShieldCheck, Gift, Truck, MessageCircle } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Carefully Curated" },
  { icon: Gift, label: "Gift-Ready Packaging" },
  { icon: Truck, label: "Doorstep Delivery" },
  { icon: MessageCircle, label: "WhatsApp Support" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-gray-100 bg-surface">
      <div className="container-page grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 sm:py-8">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
