"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">About Us</h3>
            <p className="text-sm site-muted">
              Coresume helps you create professional, ATS-friendly resumes in minutes.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm site-muted hover:site-accent transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm site-muted hover:site-accent transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm site-muted hover:site-accent transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm site-muted hover:site-accent transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm site-muted"><a href={`mailto:coresumeteam@gmail.com`} className="text-white no-underline hover:site-accent transition">coresumeteam@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm site-muted">© 2025 Coresume. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-4 text-sm site-muted">
          <a href="/terms" className="hover:underline">Terms & Conditions</a>
          <span>|</span>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="/refund-policy" className="hover:underline">Refund Policy</a>
          <span>|</span>
          <a href="/contact" className="hover:underline">Contact Us</a>
        </div>
      </div>
    </footer>
  );
} 
