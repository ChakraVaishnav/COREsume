"use client";
export default function TextAreaField({ label, value, onChange, placeholder = '', rows = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-semibold text-black">{label}</label>}
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-2 border-gray-200 bg-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
      />
    </div>
  );
}
