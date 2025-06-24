"use client";

import PageLayout from "@/components/PageLayout";

export default function ContactPage() {
  return (
    <PageLayout title="Contact Us">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Get in Touch</h2>
          <p className="text-gray-600">
            Have questions or need assistance? We're here to help! Reach out to us through any of the following channels.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Contact Information</h3>
            <div className="space-y-2">
              <p className="flex items-center text-gray-600">
                <span className="font-medium mr-2">Email:</span>
                coresumeteam@gmail.com
              </p>
              <p className="flex items-center text-gray-600">
                <span className="font-medium mr-2">Hours:</span>
                Saturday- Sunday, 10:00 AM - 6:00 PM ISTD
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 