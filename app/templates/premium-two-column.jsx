'use client';

import { useEffect, useState } from 'react';

export default function PremiumTwoColumnTemplate({ data }) {
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
    if (Array.isArray(section))
      return section.some((item) =>
        Object.values(item).some((value) => value && value.trim() !== '')
      );
    return section.trim() !== '';
  };

  return (
    <div className="p-8 text-black text-[13px] font-sans leading-relaxed">
      {/* Name at the top center */}
      <header className="text-center mb-4">
        <h1 className="text-[19px] font-bold uppercase font-serif">{personalInfo.name}</h1>
        {form.appliedJob && (
          <p className="text-[13px] font-semibold text-gray-800 mt-0.5 font-sans">
            {form.appliedJob}
          </p>
        )}
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left Sidebar */}
        <aside className="col-span-1 space-y-5 pr-4 border-r border-gray-300 font-sans">
          {/* Contact Info */}
          <div className="space-y-1 text-[12px] font-normal">
            <p>{personalInfo.phone}</p>
            <a
              href={`mailto:${personalInfo.email}`}
              className="text-black no-underline hover:text-blue-600 transition"
            >
              {personalInfo.email}
            </a>
            {personalInfo.linkedin && (
              <p>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  className="text-black no-underline hover:text-blue-600 transition"
                >
                  LinkedIn
                </a>
              </p>
            )}
            {personalInfo.github && (
              <p>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  className="text-black no-underline hover:text-blue-600 transition"
                >
                  GitHub
                </a>
              </p>
            )}
            {personalInfo.portfolio && (
              <p>
                <a
                  href={personalInfo.portfolio}
                  target="_blank"
                  className="text-black no-underline hover:text-blue-600 transition"
                >
                  Portfolio
                </a>
              </p>
            )}
          </div>

          {hasContent(skills) && (
            <Section title="Key Skills">
              <p className="whitespace-pre-line">{skills}</p>
            </Section>
          )}

          {hasContent(education) && (
            <Section title="Education">
              <p className="whitespace-pre-line">{education}</p>
            </Section>
          )}

          {hasContent(achievements) && (
            <Section title="Achievements">
              <p className="whitespace-pre-line">{achievements}</p>
            </Section>
          )}

          {hasContent(interests) && (
            <Section title="Interests">
              <p className="whitespace-pre-line">{interests}</p>
            </Section>
          )}
        </aside>

        {/* Right Content */}
        <main className="col-span-2 space-y-6 pl-4 text-[13px] font-sans font-normal">
          {hasContent(summary) && (
            <Section title="Professional Summary">
              <p className="text-justify">{summary}</p>
            </Section>
          )}

          {hasContent(experience) && (
            <Section title="Work Experience">
              {experience.map((exp, index) => (
                <div key={index} className="mb-2">
                  <h3 className="font-semibold font-serif">
                    {exp.role} — {exp.company}
                  </h3>
                  <p className="text-gray-600 text-[12px] font-sans">{exp.duration}</p>
                  <p className="whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </Section>
          )}

          {hasContent(projects) && (
            <Section title="Projects">
              {projects.map((project, index) => (
                <div key={index} className="mb-2">
                  <h3 className="font-semibold text-black font-serif">
                    {project.link ? (
                      <a
                        href={project.link}
                        target="_blank"
                        className="font-semibold text-black no-underline"
                      >
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  <p className="whitespace-pre-line">{project.description}</p>
                </div>
              ))}
            </Section>
          )}
        </main>
      </div>
    </div>
  );
}

// Section heading only has boldness
function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-[12px] font-bold uppercase font-serif border-b border-gray-300 pb-1 mb-1">
        {title}
      </h2>
      {children}
    </section>
  );
}
