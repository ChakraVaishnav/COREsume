"use client";

import PageLayout from "@/components/PageLayout";
import AdUnit from "@/components/AdUnit";

export default function AboutPage() {
  return (
    <PageLayout title="About Us">
      <div className="space-y-6">
        <p>
          Welcome to COREsume, your trusted partner in creating professional, ATS-friendly resumes. 
          Our mission is to help job seekers present their best selves to potential employers through 
          well-crafted, visually appealing resumes.
        </p>
        
        <h2 className="text-xl font-semibold text-black">Our Story</h2>
        <p>
          Founded in 2025, COREsume was born from a simple observation: creating a professional resume 
          shouldn't be complicated. We've combined modern design principles with ATS optimization to 
          create a platform that makes resume building both easy and effective.<br></br>
          This can be really useful for freshers who are struggling to create an job ready resume on their own.
        </p>

        <h2 className="text-xl font-semibold text-black">What We Offer</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Professional, ATS-friendly resume templates</li>
          <li>Easy-to-use resume builder</li>
          <li>Real-time preview and editing</li>
          <li>Export to multiple formats</li>
          <li>Expert tips and guidance</li>
        </ul>

        <h2 className="text-xl font-semibold text-black">Our Commitment</h2>
        <p>
          We're committed to helping you succeed in your job search. Our platform is continuously 
          updated with the latest resume trends and ATS requirements to ensure your resume stands out 
          in the competitive job market.
        </p>

        <div className="mt-8">
          <AdUnit slot="3878228967" />
        </div>
      </div>
    </PageLayout>
  );
}