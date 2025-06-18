import { Suspense } from "react";
import ResumeForm from "./ResumeForm"; // adjust path if needed

export default function ResumeFormPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <ResumeForm />
    </Suspense>
  );
}
