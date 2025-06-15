export default function TwoColumnTemplate({ data }) {
  const { personalInfo, summary, skills, education, projects, experience, achievements, interests } = data;

  return (
    <div className="p-8 text-black text-[13px] font-sans leading-relaxed"> {/* ↓ 1px */}

      {/* Name at the top center */}
      <header className="text-center mb-6">
        <h1 className="text-[19px] font-bold uppercase">{personalInfo.name}</h1> {/* ↓ 1px */}
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-4">

        {/* Left Sidebar */}
        <aside className="col-span-1 space-y-5 pr-4 border-r border-gray-300">

          {/* Contact Info */}
          <div className="space-y-1 text-[12px] font-normal"> {/* ↓ 1px */}
            <p>{personalInfo.phone}</p>
            <a href={`mailto:${personalInfo.email}`} className="text-black no-underline">{personalInfo.email}</a>
            {personalInfo.linkedin && <p><a href={personalInfo.linkedin} target="_blank" className="text-black no-underline">LinkedIn</a></p>}
            {personalInfo.github && <p><a href={personalInfo.github} target="_blank" className="text-black no-underline">GitHub</a></p>}
            {personalInfo.portfolio && <p><a href={personalInfo.portfolio} target="_blank" className="text-black no-underline">Portfolio</a></p>}
          </div>

          <Section title="Key Skills">
            <p className="whitespace-pre-line">{skills}</p>
          </Section>

          <Section title="Education">
            <p className="whitespace-pre-line">{education}</p>
          </Section>

          {achievements && (
            <Section title="Achievements">
              <p className="whitespace-pre-line">{achievements}</p>
            </Section>
          )}
          {interests && (
            <Section title="Interests">
              <p className="whitespace-pre-line">{interests}</p>
            </Section>
          )}
        </aside>

        {/* Right Content */}
        <main className="col-span-2 space-y-6 pl-4 text-[13px] font-normal"> {/* ↓ 1px */}
          {summary && (
            <Section title="Professional Summary">
              <p className="text-justify">{summary}</p>
            </Section>
          )}

          {projects && projects.length > 0 && (
            <Section title="Projects">
              {projects.map((project, index) => (
                <div key={index} className="mb-2">
                  {project.link ? (
                    <a href={project.link} target="_blank" className="font-normal text-black no-underline">
                      {project.name}
                    </a>
                  ) : (
                    <h3 className="font-normal">{project.name}</h3>
                  )}
                  <p className="whitespace-pre-line">{project.description}</p>
                </div>
              ))}
            </Section>
          )}

          {experience && experience.length > 0 && (
            <Section title="Work Experience">
              {experience.map((exp, index) => (
                <div key={index} className="mb-2">
                  <h3 className="font-normal">{exp.role} — {exp.company}</h3>
                  <p className="text-gray-600 text-[12px]">{exp.duration}</p> {/* ↓ 1px */}
                  <p className="whitespace-pre-line">{exp.description}</p>
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
      <h2 className="text-[12px] font-semibold uppercase border-b-1 border-gray-300 pb-1 mb-1"> {/* ↓ 1px */}
        {title}
      </h2>
      {children}
    </section>
  );
}



