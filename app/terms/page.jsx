"use client";

import PageLayout from "@/components/PageLayout";

export default function TermsPage() {
  return (
    <PageLayout title="Terms and Conditions">
      <div className="space-y-6">
        <p className="text-gray-600">
          Last updated: March 2024
        </p>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing and using COREsume, you agree to be bound by these Terms and Conditions. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">2. Use of Service</h2>
          <p className="text-gray-600">
            You agree to use COREsume only for lawful purposes and in accordance with these Terms. 
            You are responsible for maintaining the confidentiality of your account and for all 
            activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">3. User Content</h2>
          <p className="text-gray-600">
            You retain all rights to your resume content. By using our service, you grant us a 
            license to store and process your content for the purpose of providing our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">4. Subscription and Payments</h2>
          <p className="text-gray-600">
            Some features of COREsume may require a subscription. By subscribing, you agree to 
            pay all fees associated with your subscription plan. We reserve the right to modify 
            our pricing with notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">5. Limitation of Liability</h2>
          <p className="text-gray-600">
            COREsume is provided "as is" without any warranties. We are not liable for any 
            damages arising from the use or inability to use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">6. Changes to Terms</h2>
          <p className="text-gray-600">
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes via email or through our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">7. Contact Information</h2>
          <p className="text-gray-600">
            For questions about these Terms and Conditions, please contact us at:
            <br />
            Email: coresumeteam@gmail.com
          </p>
        </section>
      </div>
    </PageLayout>
  );
} 