'use client';

import { useEffect, useState } from 'react';

export default function AtsClassicTemplate() {
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

  const skillList = typeof skills === 'string'
    ? skills
        .split(/\n+/)
        .map((line) => line.replace(/^[•\-]\s*/, '').trim())
        .filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl mx-auto border border-gray-300 bg-white text-[11px] leading-[1.55] font-sans text-black">
      <header className="border-b-2 border-black">
        <div className="px-8 pt-7 pb-5 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-black uppercase tracking-[0.18em] text-black">{personalInfo.name}</h1>
            {form.appliedJob && <p className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.09em] text-gray-800 letter-spacing-[0.05em]">{form.appliedJob}</p>}
          </div>
          <div className="min-w-56 space-y-1.5 text-right text-[10.5px] text-gray-700">
            {personalInfo.phone && <p className="font-medium">{personalInfo.phone}</p>}
            {personalInfo.email && <p><a href={`mailto:${personalInfo.email}`} className="text-blue-600 hover:underline">{personalInfo.email}</a></p>}
            {personalInfo.linkedin && <p><a href={personalInfo.linkedin} className="text-blue-600 hover:underline">LinkedIn</a></p>}
            {personalInfo.github && <p><a href={personalInfo.github} className="text-blue-600 hover:underline">GitHub</a></p>}
            {personalInfo.portfolio && <p><a href={personalInfo.portfolio} className="text-blue-600 hover:underline">Portfolio</a></p>}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[240px_1fr] gap-0">
        <aside className="border-r border-gray-300 bg-gray-50 px-6 py-6">
          {hasContent(skills) && (
            <SidebarSection title="Core Skills">
              {skillList.length > 0 ? (
                <ul className="space-y-1.5 text-[10.5px] leading-[1.45] text-black">
                  {skillList.map((skill) => (
                    <li key={skill} className="pl-3 -indent-3">
                      <span className="font-bold">• </span>{skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-line">{skills}</p>
              )}
            </SidebarSection>
          )}

          {hasContent(education) && (
            <SidebarSection title="Education">
              <p className="whitespace-pre-line">{education}</p>
            </SidebarSection>
          )}

          {hasContent(achievements) && (
            <SidebarSection title="Highlights">
              <p className="whitespace-pre-line">{achievements}</p>
            </SidebarSection>
          )}

          {hasContent(interests) && (
            <SidebarSection title="Interests">
              <p className="whitespace-pre-line">{interests}</p>
            </SidebarSection>
          )}
        </aside>

        <main className="px-8 py-6">
          {hasContent(summary) && (
            <MainSection title="Profile Snapshot">
              <p className="whitespace-pre-line">{summary}</p>
            </MainSection>
          )}

          {hasContent(experience) && (
            <MainSection title="Professional Experience">
              {experience.map((exp, index) => (
                <article key={index} className="mb-4 border-b border-gray-200 pb-3 last:mb-0 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.04em]">{exp.role || 'Role'}{exp.company ? `, ${exp.company}` : ''}</h3>
                    </div>
                    {exp.duration && <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">{exp.duration}</p>}
                  </div>
                  <p className="mt-2 whitespace-pre-line">{exp.description}</p>
                </article>
              ))}
            </MainSection>
          )}

          {hasContent(projects) && (
            <MainSection title="Selected Projects">
              {projects.map((project, index) => (
                <article key={index} className="mb-4 border-b border-gray-200 pb-3 last:mb-0 last:border-b-0 last:pb-0">
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.04em]">
                    {project.link ? (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-black no-underline">
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  <p className="mt-2 whitespace-pre-line">{project.description}</p>
                </article>
              ))}
            </MainSection>
          )}

          {/* Coding Profiles */}
          {Array.isArray(codingProfiles) && codingProfiles.some(p => p.platform || p.username) && (
            <MainSection title="Coding Profiles">
              <p>
                {codingProfiles.filter(p => p.platform || p.username).map((profile, index) => (
                  <span key={index}>
                    {index > 0 && ' | '}
                    {profile.platform && <span className="font-semibold">{profile.platform}: </span>}
                    {profile.link ? (
                      <a href={profile.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.username || profile.link}
                      </a>
                    ) : (
                      <span>{profile.username}</span>
                    )}
                  </span>
                ))}
              </p>
            </MainSection>
          )}

          {/* Custom Sections */}
          {Array.isArray(customSections) && customSections.map((section, index) => (
            section.title || section.content ? (
              <MainSection key={index} title={section.title || 'Custom Section'}>
                <p className="whitespace-pre-line">{section.content}</p>
              </MainSection>
            ) : null
          ))}
        </main>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <section className="mb-5 last:mb-0">
      <h2 className="mb-2 border-b border-gray-400 pb-1 text-[10px] font-bold uppercase tracking-[0.14em]">{title}</h2>
      {children}
    </section>
  );
}

function MainSection({ title, children }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="mb-3 border-b-2 border-black pb-1 text-[11px] font-bold uppercase tracking-[0.16em]">{title}</h2>
      {children}
    </section>
  );
}
