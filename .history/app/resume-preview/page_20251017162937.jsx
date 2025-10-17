"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SingleColumnTemplate from '../templates/single-column';
import TwoColumnTemplate from '../templates/two-column';
import TimelineTemplate from '../templates/timeline';
import PremiumSingleColumnResume from '../templates/premium-single-column';
import PremiumTwoColumnTemplate from '../templates/premium-two-column';
import Navbar from "@/components/Navbar";

export default function ResumePreview() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [warningStep, setWarningStep] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const creditDeductedRef = useRef(false);

  useEffect(() => {
    try {
      const savedForm = localStorage.getItem('resumeFormData');
      const savedTemplate = localStorage.getItem('resumeTemplate');
      const userData = JSON.parse(localStorage.getItem('user'));

      if (!savedForm || !savedTemplate) throw new Error('Resume data not found');
      if (!userData?.email) {
        router.push('/login');
        return;
      }

      setResumeData({ data: JSON.parse(savedForm), template: savedTemplate });
      fetchCredits(userData.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const calculatePages = () => {
      const resume = document.getElementById('resume-container');
      if (resume) {
        const height = resume.scrollHeight;
        const estimatedPages = Math.ceil(height / 1122); // A4 page height in px
        setPageCount(estimatedPages);
      }
    };

    setTimeout(calculatePages, 300);
    window.addEventListener('resize', calculatePages);
    return () => window.removeEventListener('resize', calculatePages);
  }, [resumeData]);

  const fetchCredits = async (email) => {
    try {
      const res = await fetch("/api/user/credits", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${email}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch credits");
      const data = await res.json();
      setCredits(data.credits);
    } catch (error) {}
  };

  const handleDownload = () => {
      window.print();
  };

  const TemplateComponent =
    resumeData?.template === 'minimalist'
      ? SingleColumnTemplate
      : resumeData?.template === 'sidebar-elegance'
        ? TwoColumnTemplate
        : resumeData?.template === 'timeline'
          ? TimelineTemplate
          : resumeData?.template === 'premium-single-column'
            ? PremiumSingleColumnResume
            : resumeData?.template === 'premium-two-column'
            ? PremiumTwoColumnTemplate
            : SingleColumnTemplate;

  if (loading) return <div className="flex justify-center items-center min-h-screen text-black">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 print:p-0">

        {/* Controls */}
        <div className="max-w-4xl mx-auto mb-8 print:hidden">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center">
              <button
                onClick={() => router.push('/resume-form')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-black border-2 border-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 font-semibold transition-all duration-200 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Form
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Estimated resume pages: <span className="font-bold text-black">{pageCount}</span></p>
              </div>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-400 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-semibold transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="max-w-4xl mx-auto">
          <div id="resume-container" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 print:shadow-none print:p-0 print:border-0 print:rounded-none">
            <TemplateComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
