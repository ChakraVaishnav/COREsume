'use client';

import { useEffect, useState } from 'react';

export default function SingleColumnTemplate() {
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

  // Helper function to check if a section has content
  const hasContent = (section) => {
    if (!section) return false;
    if (Array.isArray(section)) return section.some(item => 
      Object.values(item).some(value => value && value.trim() !== '')
    );
    return section.trim() !== '';
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans text-[11px] leading-[1.4rem] print:text-[11px] print:leading-[1.4rem]">
      {/* Header */}
      <header className="mb-2">
        <h1 className="text-[18px] font-bold">{personalInfo.name}</h1>
        <p className="text-[12px] text-gray-700 mt-0.5">
          <a href={`mailto:${personalInfo.email}`} className="text-black no-underline hover:text-yellow-500 transition">{personalInfo.email}</a> | {personalInfo.phone} 
          {personalInfo.linkedin && <> | <a href={personalInfo.linkedin} className="text-black no-underline hover:text-yellow-500 transition">LinkedIn</a></>}
          {personalInfo.github && <> | <a href={personalInfo.github} className="text-black no-underline hover:text-yellow-500 transition">GitHub</a></>}
          {personalInfo.portfolio && <> | <a href={personalInfo.portfolio} className="text-black no-underline hover:text-yellow-500 transition">Portfolio</a></>}
        </p>
      </header>

      {/* Summary */}
      {hasContent(summary) && (
        <section className="mb-2">
          <h2 className="font-semibold border-b border-gray-300 mb-0.5 uppercase text-[11px]">Professional Summary</h2>
          <p className="whitespace-pre-line">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {hasContent(skills) && (
        <section className="mb-2">
          <h2 className="font-semibold border-b border-gray-300 mb-0.5 uppercase text-[11px]">Skills</h2>
          <p className="whitespace-pre-line">{skills}</p>
        </section>
      )}

      {/* Education */}
      {hasContent(education) && (
        <section className="mb-2">
          <h2 className="font-semibold border-b border-gray-300 mb-0.5 uppercase text-[11px]">Education</h2>
          <p className="whitespace-pre-line">{education}</p>
        </section>
      )}

      {/* Experience */}
      {hasContent(experience) && (
        <section className="mb-2">
          <h2 className="font-semibold border-b border-gray-300 mb-0.5 uppercase text-[11px]">Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-1">
              <h3 className="text-[11px] font-bold">{exp.role} — {exp.company}</h3>
              <p className="text-[10px] text-gray-500 mb-0.5">{exp.duration}</p>
              <p className="whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {hasContent(projects) && (
        <section className="mb-2">
          <h2 className="font-semibold border-b border-gray-300 mb-0.5 uppercase text-[11px]">Projects</h2>
          {projects.map((proj, index) => (
            <div key={index} className="mb-1">
              <h3 className="font-semibold">
                {proj.link ? (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-black no-underline">
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
        <section className="mb-2">
          <h2 className="font-semibold border-b border-gray-300 mb-0.5 uppercase text-[11px]">Achievements</h2>
          <p className="whitespace-pre-line">{achievements}</p>
        </section>
      )}

      {/* Interests */}
      {hasContent(interests) && (
        <section className="mb-2">
          <h2 className="font-semibold border-b border-gray-300 mb-0.5 uppercase text-[11px]">Interests</h2>
          <p className="whitespace-pre-line">{interests}</p>
        </section>
      )}
    </div>
  );
}
