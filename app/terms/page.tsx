import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { businessConfig } from "@/config/business";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for using the ${businessConfig.name} website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container-page py-10 pb-16">
      <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />
      <div className="prose-sm mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Terms & Conditions</h1>
        <p className="mb-4 text-sm text-gray-500">
          Placeholder terms — replace with your store&apos;s reviewed terms
          before launch.
        </p>

        <div className="flex flex-col gap-5 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="mb-1 text-base font-semibold text-gray-900">
              Product Information
            </h2>
            <p>
              Product descriptions, images and specifications on this website are
              provided for general information. Images are for illustration and
              minor differences may exist. Details are confirmed by our team
              when your order is placed.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-semibold text-gray-900">
              Orders and Payment
            </h2>
            <p>
              Orders are currently accepted via WhatsApp or the checkout form
              and are payable by cash on delivery or in person at the
              store. Online payment is not currently supported.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-semibold text-gray-900">
              Pricing and Availability
            </h2>
            <p>
              Prices and stock availability shown on this website are subject
              to change and confirmation by our team at the time of
              order.
            </p>
          </section>
          <section>
            <h2 className="mb-1 text-base font-semibold text-gray-900">
              Contact
            </h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href={`mailto:${businessConfig.email}`} className="text-brand-700 hover:underline">
                {businessConfig.email}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
