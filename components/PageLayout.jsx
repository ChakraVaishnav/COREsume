"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function PageLayout({ children, title }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-yellow-500 transition mb-8"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-black mb-8">{title}</h1>
        <div className="prose prose-sm max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
} 