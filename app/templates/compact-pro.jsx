'use client';

import { useEffect, useState } from 'react';

export default function CompactProTemplate() {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('resumeFormData');
    if (data) {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed.experience)) {
        parsed.experience = [{ role: '', company: '', duration: '', description: '' }];
      }
      if (!Array.isArray(parsed.projects)) {
        parsed.projects = [{ name: '', description: '', link: '' }];
      }
      setForm(parsed);
    }
  }, []);

  if (!form) return <p className="text-center p-8 text-sm">Loading resume...</p>;

  const { personalInfo, summary, skills, education, experience, projects, achievements, interests, codingProfiles, customSections } = form;

  const hasContent = (section) => {
    if (!section) return false;
    if (Array.isArray(section)) {
      return section.some((item) => Object.values(item).some((value) => value && value.trim() !== ''));
    }
    return section.trim() !== '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-[11px] leading-[1.45] font-sans text-black border border-gray-300">
      <header className="grid grid-cols-3 gap-4 items-start border-b-2 border-black pb-3 mb-3">
        <div className="col-span-2">
          <h1 className="text-[24px] font-bold tracking-wide uppercase">{personalInfo.name}</h1>
          {form.appliedJob && <p className="text-[12px] font-semibold mt-0.5">{form.appliedJob}</p>}
        </div>
        <div className="text-[10.5px] text-right">
          <div>{personalInfo.phone}</div>
          <div>
            <a href={`mailto:${personalInfo.email}`} className="text-black no-underline">{personalInfo.email}</a>
          </div>
          {personalInfo.linkedin && <div><a href={personalInfo.linkedin} className="text-black no-underline">LinkedIn</a></div>}
          {personalInfo.github && <div><a href={personalInfo.github} className="text-black no-underline">GitHub</a></div>}
          {personalInfo.portfolio && <div><a href={personalInfo.portfolio} className="text-black no-underline">Portfolio</a></div>}
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <aside className="col-span-1 bg-gray-100 border border-gray-300 p-3">
          {hasContent(skills) && (
            <Section title="Core Skills" compact>
              <p className="whitespace-pre-line">{skills}</p>
            </Section>
          )}
          {hasContent(education) && (
            <Section title="Education" compact>
              <p className="whitespace-pre-line">{education}</p>
            </Section>
          )}
          {hasContent(achievements) && (
            <Section title="Achievements" compact>
              <p className="whitespace-pre-line">{achievements}</p>
            </Section>
          )}
          {hasContent(interests) && (
            <Section title="Interests" compact>
              <p className="whitespace-pre-line">{interests}</p>
            </Section>
          )}
        </aside>

        <main className="col-span-3">
          {hasContent(summary) && (
            <Section title="Professional Summary">
              <p className="whitespace-pre-line">{summary}</p>
            </Section>
          )}

          {hasContent(experience) && (
            <Section title="Experience">
              {experience.map((exp, index) => (
                <div key={index} className="mb-2.5 border-l-2 border-gray-300 pl-2">
                  <div className="flex flex-wrap justify-between gap-x-3">
                    <h3 className="font-bold">{exp.role} | {exp.company}</h3>
                    <p className="text-gray-600">{exp.duration}</p>
                  </div>
                  <p className="whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </Section>
          )}

          {hasContent(projects) && (
            <Section title="Projects">
              {projects.map((project, index) => (
                <div key={index} className="mb-2.5 border-l-2 border-gray-300 pl-2">
                  <h3 className="font-bold">
                    {project.link ? (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-black no-underline">
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

          {/* Coding Profiles */}
          {Array.isArray(codingProfiles) && codingProfiles.some(p => p.platform || p.username) && (
            <Section title="Coding Profiles">
              <p>
                {codingProfiles.filter(p => p.platform || p.username).map((profile, index) => (
                  <span key={index}>
                    {index > 0 && ' | '}
                    {profile.platform && <span className="font-semibold">{profile.platform}: </span>}
                    {profile.link ? (
                      <a href={profile.link} target="_blank" rel="noopener noreferrer" className="text-black no-underline">
                        {profile.username || profile.link}
                      </a>
                    ) : (
                      <span>{profile.username}</span>
                    )}
                  </span>
                ))}
              </p>
            </Section>
          )}

          {/* Custom Sections */}
          {Array.isArray(customSections) && customSections.map((section, index) => (
            section.title || section.content ? (
              <Section key={index} title={section.title || 'Custom Section'}>
                <p className="whitespace-pre-line">{section.content}</p>
              </Section>
            ) : null
          ))}
        </main>
      </div>
    </div>
  );
}

function Section({ title, children, compact = false }) {
  return (
    <section className={compact ? '' : 'mb-3'}>
      <h2 className="text-[11px] font-bold uppercase border-b border-gray-400 pb-0.5 mb-1">{title}</h2>
      {children}
    </section>
  );
}
