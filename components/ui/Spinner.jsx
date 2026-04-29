"use client";
export default function Spinner({ size = 16, className = "" }) {
  const px = typeof size === "number" ? `${size}px` : size;
  return (
    <div
      className={`inline-block rounded-full border-4 border-yellow-400 border-t-transparent animate-spin ${className}`}
      style={{ width: px, height: px }}
      aria-hidden="true"
    />
  );
}
