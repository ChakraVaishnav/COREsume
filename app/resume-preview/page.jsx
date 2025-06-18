'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SingleColumnTemplate from '../templates/single-column';
import TwoColumnTemplate from '../templates/two-column';
import Navbar from "@/components/Navbar";

export default function ResumePreview() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    try {
      const savedForm = localStorage.getItem('resumeFormData');
      const savedTemplate = localStorage.getItem('resumeTemplate');
      const userData = JSON.parse(localStorage.getItem('user'));

      if (!savedForm || !savedTemplate) {
        throw new Error('Resume data not found in local storage');
      }

      if (!userData?.email) {
        router.push('/login');
        return;
      }

      setResumeData({
        data: JSON.parse(savedForm),
        template: savedTemplate
      });

      // Fetch credits
      fetchCredits(userData.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-hide toast after 3 seconds
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
      const response = await fetch("/api/user/credits", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${email}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const handleDownload = async () => {
    if (credits < 1) {
      setShowToast(true);
      return;
    }

    const confirmGeneration = window.confirm(
      "Are you sure you want to generate your resume with the current data?\n\n" +
      "Click 'OK' to proceed with resume generation (1 credit will be used).\n" +
      "Click 'Cancel' to review your data first."
    );

    if (!confirmGeneration) {
      return;
    }

    // Set up print event listeners
    const handleBeforePrint = () => {
      setIsPrinting(true);
    };

    const handleAfterPrint = async () => {
      setIsPrinting(false);
      
      // Deduct credit after successful print
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await fetch("/api/user/deduct-credit", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userData.email}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to deduct credit");
        }

        // Update credits in state
        setCredits(prev => prev - 1);
        
        // Show success message
        alert("Resume generated successfully! Your credit has been used.");
      } catch (error) {
        console.error("Error deducting credit:", error);
        alert("There was an error processing your credit. Please contact support.");
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    // Trigger print
    window.print();

    // Clean up event listeners
    window.removeEventListener('beforeprint', handleBeforePrint);
    window.removeEventListener('afterprint', handleAfterPrint);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-black">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  const Template = resumeData.template === 'single-column'
    ? SingleColumnTemplate
    : TwoColumnTemplate;

  const handleBackToForm = () => {
    router.push('/resume-form');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="min-h-screen bg-white p-8 print:p-0">
        {/* Toast Message */}
        {showToast && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out">
            <p className="font-semibold">Insufficient Credits!</p>
            <p className="text-sm">Redirecting to pricing page...</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between max-w-[210mm] mx-auto mb-4 print:hidden">
          <button 
            onClick={handleBackToForm} 
            className="bg-white text-yellow-500 border-2 border-yellow-500 px-6 py-2 rounded hover:bg-yellow-500 hover:text-white transition-colors font-semibold w-40"
          >
            Back to Form
          </button>

          <button
            onClick={handleDownload}
            className="bg-yellow-500 text-white border-2 border-yellow-500 px-6 py-2 rounded hover:bg-white hover:text-yellow-500 transition-colors font-semibold w-40"
          >
            Download PDF
          </button>
        </div>

        {/* Resume Preview */}
        <div className="max-w-[210mm] mx-auto bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-yellow-200 p-8 print:shadow-none print:p-0 print:border-0">
          <Template data={resumeData.data} />
        </div>
      </div>
    </div>
  );
}
