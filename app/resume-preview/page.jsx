"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SingleColumnTemplate from '../templates/single-column';
import TwoColumnTemplate from '../templates/two-column';
import TimelineTemplate from '../templates/timeline';
import PremiumSingleColumnResume from '../templates/premium-single-column';
import PremiumTwoColumnTemplate from '../templates/premium-two-column';
import AtsClassicTemplate from '../templates/ats-classic';
import ExecutiveEdgeTemplate from '../templates/executive-edge';
import ImpactGridTemplate from '../templates/impact-grid';
import CompactProTemplate from '../templates/compact-pro';
import { templates } from '../utils/template';
import Navbar from "@/components/Navbar";

export default function ResumePreview() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageCount, setPageCount] = useState(1);
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportMode, setIsExportMode] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setIsExportMode(params.get('export') === '1');
  }, []);

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
  const checkIsRated = async () =>{
    try {
      const tpl = resumeData?.template;
      if (!tpl) {

        return false;
      }

      const url = `/api/feedback/verify-rated?template=${encodeURIComponent(tpl)}`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        return false;
      }

      const json = await res.json();

      // If the endpoint says the user already rated, don't show the modal
      if (json.rated) {
        setShowRating(false);
        return true;
      }

      setShowRating(true);
      return false;
    } catch (err) {
      return false;
    }
  }

  const handleOpenDownloadOptions = () => {
    if (!resumeData?.data || !resumeData?.template) return;
    setShowDownloadOptions(true);
  };

  const handleDirectDownload = async () => {
    if (!resumeData?.data || !resumeData?.template) return;

    setShowDownloadOptions(false);
    setIsDownloading(true);
    try {
      const res = await fetch('/api/export/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          data: resumeData.data,
          template: resumeData.template,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const fileName = String(resumeData?.data?.personalInfo?.name || 'resume')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'resume';

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      await checkIsRated();
    } catch (err) {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintDownload = async () => {
    if (typeof window === 'undefined') return;

    setShowDownloadOptions(false);
    setIsPrinting(true);

    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 120);
        });
      });

      window.print();
      await checkIsRated();
    } catch (err) {
      alert('Unable to open print dialog. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDocxDownload = async () => {
    if (!resumeData?.data) return;

    setShowDownloadOptions(false);
    setIsDownloadingDocx(true);
    try {
      const res = await fetch('/api/export/resume-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          data: resumeData.data,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate DOCX');
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const fileName = String(resumeData?.data?.personalInfo?.name || 'resume')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'resume';

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${fileName}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      await checkIsRated();
    } catch (err) {
      alert('Failed to download DOCX. Please try again.');
    } finally {
      setIsDownloadingDocx(false);
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
              : resumeData?.template === 'ats-classic'
                ? AtsClassicTemplate
                : resumeData?.template === 'executive-edge'
                  ? ExecutiveEdgeTemplate
                  : resumeData?.template === 'impact-grid'
                    ? ImpactGridTemplate
                    : resumeData?.template === 'compact-pro'
                      ? CompactProTemplate
                      : SingleColumnTemplate;
  const activeTemplate = templates.find((template) => template.slug === resumeData?.template);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-black">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className={isExportMode ? 'bg-white' : 'min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex flex-col print:pt-0'}>
      {!isExportMode && (
      <div className="print:hidden">
        <Navbar fixed />
      </div>
      )}

      <main className={isExportMode ? 'p-0' : 'flex-1 pt-16 px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10 print:p-0'}>
        {/* Controls */}
        {!isExportMode && (
        <div className="max-w-4xl mx-auto mt-3 sm:mt-6 mb-4 sm:mb-8 print:hidden">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
              <button
                onClick={() => router.push('/resume-form')}
                className="w-full md:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-linear-to-r from-gray-100 to-gray-200 text-black border-2 border-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 font-semibold transition-all duration-200 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Form
              </button>

              <div className="text-center order-first md:order-0">
                <p className="text-sm text-gray-600">{activeTemplate?.name || "Resume Preview"} • Pages: <span className="font-bold text-black">{pageCount}</span></p>
              </div>

              <button
                onClick={handleOpenDownloadOptions}
                disabled={isDownloading || isDownloadingDocx || isPrinting}
                className="w-full md:w-auto justify-center flex items-center gap-2 px-5 py-3 bg-linear-to-r from-yellow-500 to-yellow-600 text-black border-2 border-yellow-400 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-semibold transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isDownloading
                  ? 'Generating PDF...'
                  : isDownloadingDocx
                    ? 'Generating DOCX...'
                    : isPrinting
                      ? 'Opening Print Dialog...'
                      : 'Download'}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Resume Preview */}
        <div className={isExportMode ? 'w-full mx-0' : 'max-w-4xl mx-auto'}>
          <div id="resume-container" className={isExportMode ? 'pdf-export bg-white' : 'bg-white rounded-2xl shadow-xl border border-gray-200 p-3 sm:p-8 print:shadow-none print:p-0 print:border-0 print:rounded-none'}>
            <TemplateComponent />
          </div>
        </div>
      </main>

      {!isExportMode && showDownloadOptions && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 print:hidden">
          <div className="w-full sm:max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-bold text-black">Choose Download Method</h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Quick PDF generates instantly. Custom mode opens the browser print dialog so you can adjust scale, margins, and destination before saving.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleDirectDownload}
                disabled={isDownloading || isDownloadingDocx || isPrinting}
                className="w-full text-left rounded-xl border-2 border-yellow-400 bg-linear-to-r from-yellow-500 to-yellow-600 px-4 py-3 text-black shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all"
              >
                <p className="font-semibold">Quick Download (Auto PDF)</p>
                <p className="text-xs text-black/80 mt-0.5">Best for one-tap download on desktop and mobile.</p>
              </button>

              <button
                onClick={handleDocxDownload}
                disabled={isDownloading || isDownloadingDocx || isPrinting}
                className="w-full text-left rounded-xl border-2 border-blue-200 bg-linear-to-r from-blue-50 to-blue-100 px-4 py-3 text-black shadow-sm hover:from-blue-100 hover:to-blue-200 transition-all"
              >
                <p className="font-semibold">Download as DOCX (Word)</p>
                <p className="text-xs text-gray-700 mt-0.5">Works well when you want to edit the file in Microsoft Word.</p>
              </button>

              <button
                onClick={handlePrintDownload}
                disabled={isDownloading || isDownloadingDocx || isPrinting}
                className="w-full text-left rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-black shadow-sm hover:bg-gray-50 transition-all"
              >
                <p className="font-semibold">Customize &amp; Save PDF</p>
                <p className="text-xs text-gray-600 mt-0.5">Opens print dialog to tune layout, scale, and page settings.</p>
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDownloadOptions(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {!isExportMode && showRating && (
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
                    const res = await fetch('/api/feedback/rating', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ score: ratingScore, comment: ratingComment, template: resumeData?.template }),
                    });
                    if (!res.ok) throw new Error('Failed to submit rating');
                    setShowRating(false);
                  } catch (err) {
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
