// lib/sanitizeHtml.js
//
// Sanitizes resume-field HTML before it's rendered with dangerouslySetInnerHTML.
// Only allows the exact tags/attrs that components/ui/RichTextEditor.jsx can
// produce (bold, italic, lists, links, line breaks) plus <br> from AI-generated
// plain text. Everything else (script, img, svg, event handlers, style, iframe,
// javascript: URLs, etc.) is stripped.
//
// This is safe to import anywhere: it no-ops to a tag-stripping fallback if
// `window` isn't available (e.g. an accidental server render), and does the
// real sanitization once it runs in the browser (or in the headless Chrome
// tab Puppeteer drives for PDF export — that's still a real browser).

const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "ul", "ol", "li", "br", "a", "div", "p", "span"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeHtml(value) {
  if (!value) return "";
  const str = String(value);

  if (typeof window === "undefined") {
    // Defensive fallback for any accidental server-side call: strip all
    // tags rather than ever risk rendering unsanitized HTML.
    return str.replace(/<[^>]*>/g, "");
  }

  // eslint-disable-next-line global-require
  const DOMPurify = require("dompurify");

  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}
