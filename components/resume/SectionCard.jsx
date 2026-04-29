"use client";
export default function SectionCard({ icon, title, children, actions }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          {icon && <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">{icon}</div>}
          <h2 className="text-2xl font-bold text-black">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
