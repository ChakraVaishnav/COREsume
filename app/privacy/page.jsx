"use client";

import PageLayout from "@/components/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy Policy">
      <div className="space-y-6">
        <p className="text-gray-600">
          Last updated: March 2024
        </p>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">1. Information We Collect</h2>
          <p className="text-gray-600">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
            <li>Name and contact information</li>
            <li>Resume content and preferences</li>
            <li>Account credentials</li>
            <li>Usage data and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
            <li>Provide and maintain our services</li>
            <li>Process your resume creation requests</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our services and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">3. Data Security</h2>
          <p className="text-gray-600">
            We implement appropriate security measures to protect your personal information. 
            However, no method of transmission over the Internet is 100% secure, and we 
            cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">4. Your Rights</h2>
          <p className="text-gray-600">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black mb-4">5. Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: privacy@resumint.com
          </p>
        </section>
      </div>
    </PageLayout>
  );
} 