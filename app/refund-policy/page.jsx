import PageLayout from "@/components/PageLayout";

export default function RefundPolicy() {
  return (
    <PageLayout title="Refund Policy">
      <p className="mb-4">There is <span className="font-semibold">no refund</span> for any purchases made on Resumint.</p>
      <p>For queries, please contact our team via the <a href="/contact" className="text-blue-600 underline">Contact Us</a> page.</p>
    </PageLayout>
  );
} 