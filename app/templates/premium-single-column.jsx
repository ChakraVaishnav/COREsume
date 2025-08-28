'use client';

import { useEffect, useState } from 'react';

export default function PremiumSingleColumnResume() {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('resumeFormData');
    if (data) {
      const parsed = JSON.parse(data);

      if (!Array.isArray(parsed.experience)) {
        parsed.experience = [
          {
            role: '',
            company: '',
            duration: '',
            description: '',
          },
        ];
      }
      setForm(parsed);
    }
  }, []);

  if (!form) return <p className="text-center p-8 text-sm">Loading resume...</p>;

  const { personalInfo, summary, skills, education, experience, projects, achievements, interests } = form;

  const hasContent = (section) => {
    if (!section) return false;
    if (Array.isArray(section)) return section.some(item => 
      Object.values(item).some(value => value && value.trim() !== '')
    );
    return section.trim() !== '';
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-serif text-[12px] leading-relaxed print:text-[12px] print:leading-relaxed">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-[22px] font-bold tracking-wide">{personalInfo.name}</h1>
        {form.appliedJob && (
          <p className="text-[13px] font-semibold text-gray-800 mt-1">{form.appliedJob}</p>
        )}
        <p className="text-[12px] text-gray-700 mt-2 space-x-2">
          <a href={`mailto:${personalInfo.email}`} className="text-black no-underline hover:text-yellow-600 transition">{personalInfo.email}</a> | {personalInfo.phone}
          {personalInfo.linkedin && <> | <a href={personalInfo.linkedin} className="text-black no-underline hover:text-yellow-600 transition">LinkedIn</a></>}
          {personalInfo.github && <> | <a href={personalInfo.github} className="text-black no-underline hover:text-yellow-600 transition">GitHub</a></>}
          {personalInfo.portfolio && <> | <a href={personalInfo.portfolio} className="text-black no-underline hover:text-yellow-600 transition">Portfolio</a></>}
        </p>
      </header>

      {/* Summary */}
      {hasContent(summary) && (
        <section className="mb-4">
          <h2 className="font-semibold border-b border-gray-400 mb-1 uppercase text-[12px] tracking-wide">Professional Summary</h2>
          <p className="whitespace-pre-line">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {hasContent(skills) && (
        <section className="mb-4">
          <h2 className="font-semibold border-b border-gray-400 mb-1 uppercase text-[12px] tracking-wide">Skills</h2>
          <p className="whitespace-pre-line">{skills}</p>
        </section>
      )}

      {/* Experience */}
      {hasContent(experience) && (
        <section className="mb-4">
          <h2 className="font-semibold border-b border-gray-400 mb-1 uppercase text-[12px] tracking-wide">Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-[12px] font-bold">{exp.role} — {exp.company}</h3>
              <p className="text-[11px] text-gray-500">{exp.duration}</p>
              <p className="whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {hasContent(education) && (
        <section className="mb-4">
          <h2 className="font-semibold border-b border-gray-400 mb-1 uppercase text-[12px] tracking-wide">Education</h2>
          <p className="whitespace-pre-line">{education}</p>
        </section>
      )}

      {/* Projects */}
      {hasContent(projects) && (
        <section className="mb-4">
          <h2 className="font-semibold border-b border-gray-400 mb-1 uppercase text-[12px] tracking-wide">Projects</h2>
          {projects.map((proj, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-semibold">
                {proj.link ? (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-black no-underline hover:text-yellow-600">
                    {proj.name}
                  </a>
                ) : (
                  proj.name
                )}
              </h3>
              <p className="whitespace-pre-line">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {hasContent(achievements) && (
        <section className="mb-4">
          <h2 className="font-semibold border-b border-gray-400 mb-1 uppercase text-[12px] tracking-wide">Achievements</h2>
          <p className="whitespace-pre-line">{achievements}</p>
        </section>
      )}

      {/* Interests */}
      {hasContent(interests) && (
        <section className="mb-4">
          <h2 className="font-semibold border-b border-gray-400 mb-1 uppercase text-[12px] tracking-wide">Interests</h2>
          <p className="whitespace-pre-line">{interests}</p>
        </section>
      )}
    </div>
  );
}
