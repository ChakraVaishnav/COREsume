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
  const [pageCount, setPageCount] = useState(1);
  const [isReviwed, setIsReviewed] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem('resumeFormData');
      const savedTemplate = localStorage.getItem('resumeTemplate');

      if (!savedForm || !savedTemplate) throw new Error('Resume data not found');
      setResumeData({ data: JSON.parse(savedForm), template: savedTemplate });
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

  const handleDownload = () => {
    window.print();
    if(isReviwed === false){
      setShowRating(true);
      setIsReviewed(true);
    }
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
      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-center mb-3">Rate your download</h3>
            <p className="text-sm text-gray-600 text-center mb-4">Please leave a rating and an optional comment</p>

            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRatingScore(s)}
                  className={`text-3xl ${s <= ratingScore ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Leave a comment (optional)"
              className="w-full border border-gray-200 rounded-md p-3 mb-4 text-sm"
              rows={4}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRating(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium"
              >
                Later
              </button>
              <button
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const res = await fetch('/api/user/rating', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ score: ratingScore, comment: ratingComment }),
                    });
                    if (!res.ok) throw new Error('Failed to submit rating');
                    setShowRating(false);
                  } catch (err) {
                    console.error(err);
                    alert('Failed to submit rating');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="px-4 py-2 rounded-md bg-yellow-500 text-black font-semibold"
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
