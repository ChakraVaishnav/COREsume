'use client';

import { useEffect, useState } from 'react';

export default function ImpactGridTemplate() {
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
    <div className="max-w-4xl mx-auto p-8 text-[12px] leading-[1.5] font-sans text-black">
      <header className="mb-5">
        <h1 className="text-[24px] font-bold">{personalInfo.name}</h1>
        {form.appliedJob && <p className="text-[13px] font-semibold mt-0.5">{form.appliedJob}</p>}
        <p className="text-[11px] mt-1">
          <a href={`mailto:${personalInfo.email}`} className="text-black no-underline">{personalInfo.email}</a>
          {' | '}
          {personalInfo.phone}
          {personalInfo.linkedin && (
            <>
              {' | '}
              <a href={personalInfo.linkedin} className="text-black no-underline">LinkedIn</a>
            </>
          )}
          {personalInfo.github && (
            <>
              {' | '}
              <a href={personalInfo.github} className="text-black no-underline">GitHub</a>
            </>
          )}
          {personalInfo.portfolio && (
            <>
              {' | '}
              <a href={personalInfo.portfolio} className="text-black no-underline">Portfolio</a>
            </>
          )}
        </p>
      </header>

      {(hasContent(summary) || hasContent(skills)) && (
        <section className="grid grid-cols-2 gap-5 mb-4">
          {hasContent(summary) && (
            <CardSection title="Summary">
              <p className="whitespace-pre-line">{summary}</p>
            </CardSection>
          )}
          {hasContent(skills) && (
            <CardSection title="Skills">
              <p className="whitespace-pre-line">{skills}</p>
            </CardSection>
          )}
        </section>
      )}

      {hasContent(experience) && (
        <Section title="Experience">
          {experience.map((exp, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-bold">{exp.role} | {exp.company}</h3>
              <p className="text-[11px] text-gray-600">{exp.duration}</p>
              <p className="whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </Section>
      )}

      {hasContent(projects) && (
        <Section title="Projects">
          {projects.map((project, index) => (
            <div key={index} className="mb-3">
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

      {(hasContent(education) || hasContent(achievements) || hasContent(interests)) && (
        <section className="grid grid-cols-3 gap-4">
          {hasContent(education) && (
            <CardSection title="Education">
              <p className="whitespace-pre-line">{education}</p>
            </CardSection>
          )}
          {hasContent(achievements) && (
            <CardSection title="Achievements">
              <p className="whitespace-pre-line">{achievements}</p>
            </CardSection>
          )}
          {hasContent(interests) && (
            <CardSection title="Interests">
              <p className="whitespace-pre-line">{interests}</p>
            </CardSection>
          )}
        </section>
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
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-4">
      <h2 className="text-[12px] font-bold uppercase border-b border-gray-400 pb-1 mb-2">{title}</h2>
      {children}
    </section>
  );
}

function CardSection({ title, children }) {
  return (
    <section className="border border-gray-300 rounded-sm p-3">
      <h2 className="text-[12px] font-bold uppercase mb-2">{title}</h2>
      {children}
    </section>
  );
}
