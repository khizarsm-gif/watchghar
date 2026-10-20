import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Package, Headset, Truck } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { businessConfig } from "@/config/business";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${businessConfig.name}, a watch store in ${businessConfig.city} offering men's, women's and smart watches.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Trusted Service",
    description:
      "Friendly, honest service from the first question to the day your watch arrives.",
  },
  {
    icon: Package,
    title: "Carefully Curated",
    description:
      "Every watch in our collection is chosen for design, build quality and value.",
  },
  {
    icon: Headset,
    title: "Customer Support",
    description:
      "Our team is available by phone and WhatsApp to answer your questions.",
  },
  {
    icon: Truck,
    title: "Convenient Ordering",
    description:
      "Order online, by phone, or via WhatsApp — with doorstep delivery or store pickup.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-10 pb-16">
      <Breadcrumbs items={[{ label: "About Us" }]} />

      <div className="grid grid-cols-1 items-center gap-10 py-4 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">About Us</h1>
          <p className="text-base leading-relaxed text-gray-600">
            {businessConfig.name} brings together classic dress watches, rugged
            sports pieces, modern smartwatches, and quality straps, all in one
            place.
          </p>
          <p className="text-base leading-relaxed text-gray-600">
            We are based in {businessConfig.city}, {businessConfig.country}.{" "}
            Whether you visit us in person or order online, our goal is the
            same: helping you find a watch you will be proud to wear, and
            getting it to you quickly and reliably.
          </p>
          <p className="text-xs text-gray-400">
            Business details above are placeholders — update them in{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5">config/business.ts</code>.
          </p>
          <div className="pt-2">
            <Link href="/contact" className="btn-primary">
              Get in Touch
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-brand-50">
          <Image
            src="/images/about.svg"
            alt="A Watch Ghar timepiece"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card flex flex-col gap-3 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-gray-50 p-6 text-sm text-gray-500">
        <strong className="text-gray-700">Disclaimer:</strong> {businessConfig.disclaimer}
      </div>
    </div>
  );
}
