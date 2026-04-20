"use client";

function isPrimitive(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function formatLabel(key) {
  return String(key || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function stringifyValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return String(value);
}

const RESUME_SECTION_ORDER = [
  "personalInfo",
  "summary",
  "education",
  "skills",
  "experience",
  "projects",
  "achievements",
  "interests",
  "codingProfiles",
  "customSections",
];

const RESUME_SECTION_LABELS = {
  personalInfo: "Personal Information",
  summary: "Professional Summary",
  education: "Education",
  skills: "Skills",
  experience: "Work Experience",
  projects: "Projects",
  achievements: "Achievements",
  interests: "Interests",
  codingProfiles: "Coding Profiles",
  customSections: "Custom Sections",
};

function ReadOnlyField({ label, value }) {
  const text = stringifyValue(value);
  const useTextArea = text.length > 120 || text.includes("\n");

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {useTextArea ? (
        <textarea
          readOnly
          value={text}
          className="h-24 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        />
      ) : (
        <input
          readOnly
          value={text}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        />
      )}
    </div>
  );
}

function ValueOnlyField({ value }) {
  const text = stringifyValue(value);
  const useTextArea = text.length > 120 || text.includes("\n");

  if (useTextArea) {
    return (
      <textarea
        readOnly
        value={text}
        className="h-24 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black"
      />
    );
  }

  return (
    <input
      readOnly
      value={text}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black"
    />
  );
}

function JsonFormRenderer({ value, heading, suppressPrimitiveLabel = false }) {
  if (isPrimitive(value)) {
    if (suppressPrimitiveLabel) {
      return <ValueOnlyField value={value} />;
    }
    return <ReadOnlyField label={heading || "Value"} value={value} />;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          No items available.
        </div>
      );
    }

    const areAllPrimitive = value.every((item) => isPrimitive(item));
    if (areAllPrimitive) {
      if (suppressPrimitiveLabel) {
        return <ValueOnlyField value={value.map((item) => stringifyValue(item)).join("\n")} />;
      }
      return (
        <ReadOnlyField
          label={heading || "Items"}
          value={value.map((item) => stringifyValue(item)).join("\n")}
        />
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={`${heading || "item"}_${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {(heading || "Item")} #{index + 1}
            </p>
            <JsonFormRenderer value={item} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value || {});
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500">
        No data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, nestedValue]) => {
        const fieldLabel = formatLabel(key);

        if (isPrimitive(nestedValue)) {
          return <ReadOnlyField key={key} label={fieldLabel} value={nestedValue} />;
        }

        return (
          <div key={key} className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{fieldLabel}</p>
            <JsonFormRenderer value={nestedValue} heading={fieldLabel} />
          </div>
        );
      })}
    </div>
  );
}

export default function ResumeDataPanel({ resumeLoading, resumeData }) {
  const orderedSections = resumeData
    ? [
        ...RESUME_SECTION_ORDER.map((key) => [key, resumeData?.[key]]),
        ...Object.entries(resumeData).filter(
          ([key]) => key !== "jobrole" && !RESUME_SECTION_ORDER.includes(key)
        ),
      ].filter(([, sectionValue]) => sectionValue !== undefined)
    : [];

  return (
    <div className="h-full min-h-0 flex flex-col text-black">
      <div className="shrink-0">
        <h2 className="text-2xl font-extrabold text-black">Your Resume</h2>
      </div>

      <div className="mt-4 min-h-0 grow overflow-y-auto pr-1">
        {resumeLoading ? (
          <p className="text-sm text-gray-600">Loading resume...</p>
        ) : resumeData ? (
          <div className="space-y-4">
            {orderedSections.map(([key, sectionValue]) => (
              <div key={key} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {RESUME_SECTION_LABELS[key] || formatLabel(key)}
                </p>
                <JsonFormRenderer
                  value={sectionValue}
                  heading={RESUME_SECTION_LABELS[key] || formatLabel(key)}
                  suppressPrimitiveLabel
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            No resume found. Create one in Resume Form and it will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
