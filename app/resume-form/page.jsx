import { Suspense } from "react";
import ResumeForm from "./ResumeForm"; // adjust path if needed

export const metadata = {
  title: "Resume Builder Form - Create ATS Friendly Resume",
  description:
    "Use COREsume's resume builder form to create ATS-friendly resumes with AI assistance, live preview, and professional templates.",
  alternates: {
    canonical: "/resume-form",
  },
  openGraph: {
    title: "Resume Builder Form - COREsume",
    description:
      "Build your ATS-friendly resume with AI support and live preview.",
    url: "/resume-form",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Builder Form - COREsume",
    description:
      "Create professional ATS-friendly resumes with AI guidance.",
  },
};

export default function ResumeFormPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <ResumeForm />
    </Suspense>
  );
}
