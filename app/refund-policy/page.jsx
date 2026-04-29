import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Refund Policy",
  description:
    "Read COREsume's refund policy for purchases and credit-related transactions.",
  alternates: {
    canonical: "/refund-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicy() {
  return (
    <PageLayout title="Refund Policy">
      <p className="mb-4">At COREsume we strive to provide high-quality digital services and credits. Please read the policy below to understand how refunds and credit adjustments are handled.</p>

      <h3 className="mt-6 font-semibold text-lg">1. Scope</h3>
      <p className="mb-4">This policy applies to purchases of digital credits, one-time purchases, and subscription charges processed through COREsume. It does not cover third-party products or services purchased through other vendors.</p>

      <h3 className="mt-4 font-semibold">2. Non‑Refundable Items</h3>
      <ul className="list-disc pl-6 mb-4">
        <li>Digital credits once redeemed or consumed are non‑refundable.</li>
        <li>One‑time delivery of digital content (for example, generated resumes or documents) is not refundable after download or delivery.</li>
        <li>Subscription fees are not refunded for past billing periods; see <strong>Subscription cancellations</strong> below for future billing.</li>
      </ul>

      <h3 className="mt-4 font-semibold">3. Exceptions & Partial Refunds</h3>
      <p className="mb-4">We consider exceptions in limited circumstances, for example:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Unauthorized or fraudulent charges — we will investigate and work with your bank where applicable.</li>
        <li>Technical failures that prevent delivery of a paid service (after verification and reasonable troubleshooting).</li>
      </ul>
      <p className="mb-4">To request an exception, contact support within <strong>14 days</strong> of the charge and provide order details and relevant evidence. Approved refunds are typically issued to the original payment method within <strong>5–10 business days</strong>.</p>

      <h3 className="mt-4 font-semibold">4. Subscription cancellations</h3>
      <p className="mb-4">You can cancel your subscription any time to prevent future billing. Cancelling does not automatically trigger a refund for the current billing period but will stop recurring charges.</p>

      <h3 className="mt-4 font-semibold">5. How to request a refund or report an issue</h3>
      <ol className="list-decimal pl-6 mb-4">
        <li>Visit our <a href="/contact" className="text-blue-600 underline">Contact Us</a> page and open a support request.</li>
        <li>Include your account email, order or transaction ID, date of purchase, and a short description of the problem.</li>
        <li>We will acknowledge receipt within 48 hours and may ask for additional information to verify and investigate.</li>
      </ol>

      <h3 className="mt-4 font-semibold">6. Chargebacks and disputes</h3>
      <p className="mb-4">If you initiate a chargeback via your payment provider, please also open a support ticket so we can investigate and respond. Repeated or fraudulent chargeback activity may result in account restrictions.</p>

      <h3 className="mt-4 font-semibold">7. Contact & support</h3>
      <p className="mb-6">For all refund requests or billing questions, contact our support team at <a href="/contact" className="text-blue-600 underline">Contact Us</a>. Include as much detail as possible to help us resolve the issue quickly.</p>

      <p className="text-sm text-gray-600">This policy is effective immediately and may be updated from time to time. If we make material changes we will notify users via the app or email.</p>
    </PageLayout>
  );
} 