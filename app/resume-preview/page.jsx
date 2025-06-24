'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SingleColumnTemplate from '../templates/single-column';
import TwoColumnTemplate from '../templates/two-column';
import TimelineTemplate from '../templates/timeline';
import Navbar from "@/components/Navbar";

export default function ResumePreview() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [warningStep, setWarningStep] = useState(0);

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
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        router.push('/pricing');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const startPrintProcess = () => {
    const handleAfterPrint = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await fetch("/api/user/deduct-credit", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.email}`
          }
        });

        if (!res.ok) throw new Error("Deducting credit failed");
        setCredits(prev => prev - 1);
        router.push("/dashboard");
      } catch (error) {
        console.error("Error deducting credit:", error);
        alert("There was an error processing your credit. Please contact support.");
      } finally {
        window.removeEventListener('afterprint', handleAfterPrint);
      }
    };

    window.addEventListener('afterprint', handleAfterPrint);
    window.print();
  };

  const handleDownload = () => {
    if (credits < 1) {
      setShowToast(true);
      return;
    }
    setWarningStep(1);
  };

  const TemplateComponent =
    resumeData?.template === 'minimalist'
      ? SingleColumnTemplate
      : resumeData?.template === 'sidebar-elegance'
        ? TwoColumnTemplate
        : TimelineTemplate;

  if (loading) return <div className="flex justify-center items-center min-h-screen text-black">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="min-h-screen bg-white p-8 print:p-0">
        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <p className="font-semibold">Insufficient Credits!</p>
            <p className="text-sm">Redirecting to pricing page...</p>
          </div>
        )}

        {/* Warning Modal */}
        {warningStep > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
              {warningStep === 1 && (
                <>
                  <h2 className="text-xl font-bold text-yellow-600 mb-3">Heads up!</h2>
                  <p className="text-gray-700 mb-5">You’re about to generate your resume. A credit will be deducted only after it’s saved successfully.</p>
                  <button
                    onClick={() => setWarningStep(2)}
                    className="bg-yellow-500 text-white px-5 py-2 rounded-md hover:bg-yellow-600"
                  >
                    Continue
                  </button>
                </>
              )}
              {warningStep === 2 && (
                <>
                  <h2 className="text-xl font-bold text-yellow-600 mb-3">Final Confirmation</h2>
                  <p className="text-gray-700 mb-5">Clicking OK will start resume download. The credit will be deducted only after it's completed.</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setWarningStep(0)}
                      className="px-5 py-2 border border-gray-400 rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setWarningStep(0);
                        setTimeout(startPrintProcess, 100);
                      }}
                      className="px-5 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between max-w-[210mm] mx-auto mb-4 print:hidden">
          <button
            onClick={() => router.push('/resume-form')}
            className="bg-white text-yellow-500 border-2 border-yellow-500 px-6 py-2 rounded hover:bg-yellow-500 hover:text-white font-semibold w-40"
          >
            Back to Form
          </button>

          <button
            onClick={handleDownload}
            className="bg-yellow-500 text-white border-2 border-yellow-500 px-6 py-2 rounded hover:bg-white hover:text-yellow-500 font-semibold w-40"
          >
            Download PDF
          </button>
        </div>

        {/* Resume Preview */}
        <div className="max-w-[210mm] mx-auto bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-yellow-200 p-8 print:shadow-none print:p-0 print:border-0">
          <TemplateComponent />
        </div>
      </div>
    </div>
  );
}