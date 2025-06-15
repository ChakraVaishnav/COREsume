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

  const { personalInfo, summary, skills, education, experience, projects, achievements,interests } = form;

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans text-[11px] leading-[1.4rem] print:text-[11px] print:leading-[1.4rem]">
      {/* Header */}
      <header className="mb-4">
  <h1 className="text-[18px] font-bold">{personalInfo.name}</h1>
  <p className="text-[12px] text-gray-700 mt-1">
    {personalInfo.email} | {personalInfo.phone} 
    {personalInfo.linkedin && <> | <a href={personalInfo.linkedin} className="text-black no-underline">LinkedIn</a></>}
    {personalInfo.github && <> | <a href={personalInfo.github} className="text-black no-underline">GitHub</a></>}
    {personalInfo.portfolio && <> | <a href={personalInfo.portfolio} className="text-black no-underline">Portfolio</a></>}
  </p>
</header>


      {/* Summary */}
      {summary && (
        <section className="mb-3">
          <h2 className="font-semibold border-b border-gray-300 mb-1 uppercase text-[11px]">Professional Summary</h2>
          <p className="whitespace-pre-line">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section className="mb-3">
          <h2 className="font-semibold border-b border-gray-300 mb-1 uppercase text-[11px]">Skills</h2>
          <p className="whitespace-pre-line">{skills}</p>
        </section>
      )}

      {/* Education */}
      {education && (
        <section className="mb-3">
          <h2 className="font-semibold border-b border-gray-300 mb-1 uppercase text-[11px]">Education</h2>
          <p className="whitespace-pre-line">{education}</p>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-3">
          <h2 className="font-semibold border-b border-gray-300 mb-1 uppercase text-[11px]">Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-[11px] font-bold">{exp.role} — {exp.company}</h3>
              <p className="text-[10px] text-gray-500 mb-1">{exp.duration}</p>
              <p className="whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-3">
          <h2 className="font-semibold border-b border-gray-300 mb-1 uppercase text-[11px]">Projects</h2>
          {projects.map((proj, index) => (
            <div key={index} className="mb-2">
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
      {achievements && (
        <section className="mb-3">
          <h2 className="font-semibold border-b border-gray-300 mb-1 uppercase text-[11px]">Achievements</h2>
          <p className="whitespace-pre-line">{achievements}</p>
        </section>
      )}
      {interests && (
        <section className='mb-3'>
          <h2 className="font-semibold border-b border-gray-300 mb-1 uppercase text-[11px]">Interests</h2>
          <p className="whitespace-pre-line">{interests}</p>
        </section>
      )}
    </div>
  );
}
