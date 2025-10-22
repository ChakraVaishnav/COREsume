"use client";

import { useEffect, useRef } from "react";

export default function AdUnit({ slot, className = "", style = {} }) {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;
    try {
      // Initialize ad after script is present
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-6429806131272523"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
