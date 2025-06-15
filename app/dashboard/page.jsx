"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-black">Resumint</h1>
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold text-black mb-4">Choose a Template</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select from our professionally designed templates to create your perfect resume
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Single Column Template */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-xl font-semibold mb-2">Single Column</h3>
                  <p className="text-gray-600">Clean and professional design with a modern layout</p>
                </div>
              </div>
              <div className="p-6">
                <Link
                  href="/resume-form?template=single-column"
                  className="block w-full text-center px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Use This Template
                </Link>
              </div>
            </div>

            {/* Two Column Template */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-xl font-semibold mb-2">Two Column</h3>
                  <p className="text-gray-600">Elegant design with a sidebar for skills and contact info</p>
                </div>
              </div>
              <div className="p-6">
                <Link
                  href="/resume-form?template=two-column"
                  className="block w-full text-center px-6 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Use This Template
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">© 2024 Resumint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}