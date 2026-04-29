"use client";
export default function Toast({ children, className = "" }) {
  return (
    <div className={`rounded-xl shadow-lg p-3 ${className}`} role="status">
      {children}
    </div>
  );
}
