'use client';

import { useEffect, useState } from 'react';

export default function TimelineTemplate() {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('resumeFormData');
    if (data) {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed.experience)) {
        parsed.experience = [
          { role: '', company: '', duration: '', description: '' },
        ];
      }
      setForm(parsed);
    }
  }, []);

  if (!form) return <p className="text-center p-8 text-sm">Loading resume...</p>;

  const {
    personalInfo,
    summary,
    skills,
    education,
    experience,
    projects,
    achievements,
    interests,
  } = form;

  const hasContent = (section) => {
    if (!section) return false;
    if (Array.isArray(section))
      return section.some((item) =>
        Object.values(item).some((value) => value && value.trim() !== '')
      );
    return section.trim() !== '';
  };

  return (
    <div
      className="max-w-[210mm] mx-auto p-6 print:p-6"
      style={{
        fontFamily: `'Merriweather', serif`,
        fontSize: '12px', // reduced from 13px
        lineHeight: '1.5',
      }}
    >
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-[18px] font-bold">{personalInfo.name}</h1> {/* reduced from 20px */}
        {form.appliedJob && (
          <p className="text-[12px] font-semibold text-gray-800 mt-0.5 mb-0.5">{form.appliedJob}</p>
        )}
        <p className="text-[11px]">
          <a href={`mailto:${personalInfo.email}`} className="text-black no-underline">{personalInfo.email}</a> | {personalInfo.phone}
          {personalInfo.linkedin && <> | <a href={personalInfo.linkedin} className="text-black no-underline">LinkedIn</a></>}
          {personalInfo.github && <> | <a href={personalInfo.github} className="text-black no-underline">GitHub</a></>}
          {personalInfo.portfolio && <> | <a href={personalInfo.portfolio} className="text-black no-underline">Portfolio</a></>}
        </p>
      </header>

      {/* Summary */}
      {hasContent(summary) && (
        <section className="mb-4">
          <h2 className="font-bold uppercase text-[13px] mb-1">Summary</h2>
          <div className="pl-2 border-l-2 border-black ml-2">
            <p className="pl-2 whitespace-pre-line">{summary}</p>
          </div>
        </section>
      )}

      {/* Experience */}
      {hasContent(experience) && (
        <section className="mb-4">
          <h2 className="font-bold uppercase text-[13px] mb-2">Experience</h2>
          <div className="ml-2 pl-4 border-l-2 border-black relative">
            {experience.map((exp, index) => (
              <div key={index} className="mb-3 relative">
                <div className="absolute -left-[10px] top-[5px] text-[11px]">●</div>
                <h3 className="text-[12px] font-bold">
                  {exp.role} — {exp.company}
                </h3>
                <p className="text-[11px] italic mb-0.5">{exp.duration}</p>
                <p className="text-[12px] whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {hasContent(education) && (
        <section className="mb-4">
          <h2 className="font-bold uppercase text-[13px] mb-1">Education</h2>
          <div className="pl-2 border-l-2 border-black ml-2">
            <p className="pl-2 whitespace-pre-line">{education}</p>
          </div>
        </section>
      )}

      {/* Projects */}
      {hasContent(projects) && (
        <section className="mb-4">
          <h2 className="font-bold uppercase text-[13px] mb-2">Projects</h2>
          <div className="ml-2 pl-4 border-l-2 border-black relative">
            {projects.map((proj, index) => (
              <div key={index} className="mb-3 relative">
                <div className="absolute -left-[10px] top-[5px] text-[11px]">●</div>
                <h3 className="font-semibold text-[12px]">
                  {proj.link ? (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-black no-underline">
                      {proj.name}
                    </a>
                  ) : (
                    proj.name
                  )}
                </h3>
                <p className="text-[12px] whitespace-pre-line">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {hasContent(skills) && (
        <section className="mb-4">
          <h2 className="font-bold uppercase text-[13px] mb-1">Skills</h2>
          <div className="pl-2 border-l-2 border-black ml-2">
            <p className="pl-2 whitespace-pre-line">{skills}</p>
          </div>
        </section>
      )}

      {/* Achievements */}
      {hasContent(achievements) && (
        <section className="mb-4">
          <h2 className="font-bold uppercase text-[13px] mb-1">Achievements</h2>
          <div className="pl-2 border-l-2 border-black ml-2">
            <p className="pl-2 whitespace-pre-line">{achievements}</p>
          </div>
        </section>
      )}

      {/* Interests */}
      {hasContent(interests) && (
        <section className="mb-4">
          <h2 className="font-bold uppercase text-[13px] mb-1">Interests</h2>
          <div className="pl-2 border-l-2 border-black ml-2">
            <p className="pl-2 whitespace-pre-line">{interests}</p>
          </div>
        </section>
      )}
    </div>
  );
}
