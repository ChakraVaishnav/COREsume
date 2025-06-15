'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SingleColumnTemplate from '../templates/single-column';
import TwoColumnTemplate from '../templates/two-column';

export default function ResumePreview() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedForm = localStorage.getItem('resumeFormData');
      const savedTemplate = localStorage.getItem('resumeTemplate');

      if (!savedForm || !savedTemplate) {
        throw new Error('Resume data not found in local storage');
      }

      setResumeData({
        data: JSON.parse(savedForm),
        template: savedTemplate
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  const Template = resumeData.template === 'single-column'
    ? SingleColumnTemplate
    : TwoColumnTemplate;

  const handleDownload = () => {
    window.print();
  };

  const handleBackToForm = () => {
    router.push('/resume-form');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0">
      {/* Buttons */}
      <div className="flex justify-between max-w-[210mm] mx-auto mb-4 print:hidden">
      <button onClick={() => router.push('/resume-form')} className="text-blue-600 mt-4">
  Back to Form
</button>

        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      {/* Resume Preview */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg p-8 print:shadow-none print:p-0">
        <Template data={resumeData.data} />
      </div>
    </div>
  );
}
