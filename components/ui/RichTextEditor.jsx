"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, Link } from "lucide-react";

export default function RichTextEditor({ value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const formatValue = (val) => {
    if (!val) return "";
    // If it's already HTML, return it
    if (/<[a-z][\s\S]*>/i.test(val)) return val;
    // Otherwise convert newlines to <br>
    return val.replace(/\n/g, "<br>");
  };

  // Sync initial value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = formatValue(value);
    }
  }, []);

  // Update innerHTML if value changes from outside (e.g. AI suggestion)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = formatValue(value);
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const addLink = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.toString().length === 0) {
      alert("Please select some text first to create a link.");
      return;
    }
    const url = window.prompt("Enter the URL (e.g., https://example.com):");
    if (url) {
      // Basic URL validation/prefixing
      const finalUrl = url.startsWith("http") ? url : `https://${url}`;
      execCommand("createLink", finalUrl);
    }
  };

  return (
    <div className={`w-full border-2 rounded-xl transition-all duration-200 overflow-hidden bg-white ${
      isFocused ? "border-yellow-400 ring-2 ring-yellow-400" : "border-gray-200 hover:border-yellow-300"
    }`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={addLink}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors"
          title="Add Link"
        >
          <Link size={16} />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full p-4 outline-none min-h-[100px] text-sm text-gray-800 rich-text-content"
        style={{ minHeight: `${rows * 1.5}rem` }}
        placeholder={placeholder}
      />
      
      <style jsx global>{`
        .rich-text-content:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rich-text-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-content ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-content a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
