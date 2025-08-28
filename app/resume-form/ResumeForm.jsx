'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { templates } from '../utils/template'; // ✅ dynamic template list

const DEFAULT_FORM = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  jobrole: '',
  summary: '',
  experience: [
    { role: '', company: '', duration: '', description: '' },
  ],
  education: '',
  skills: '',
  achievements: '',
  projects: [
    { name: '', description: '', link: '' },
  ],
  interests: '',
};

function ResumeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [template, setTemplate] = useState('single-column');
  const isInitialLoad = useRef(true);

  // ✅ Load saved form/template from localStorage (once)
  useEffect(() => {
    if (isInitialLoad.current) {
      const savedForm = localStorage.getItem('resumeFormData');
      const savedTemplate = localStorage.getItem('resumeTemplate');

      if (savedForm) setForm(JSON.parse(savedForm));
      if (savedTemplate) setTemplate(savedTemplate);

      isInitialLoad.current = false;
    }
  }, []);

  // ✅ Update template from searchParams
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      const isValid = templates.some(t => t.slug === templateParam);
      if (isValid) {
        setTemplate(templateParam);
        localStorage.setItem('resumeTemplate', templateParam);
      }
    }
  }, [searchParams]);

  // ✅ Save form to localStorage on change
  useEffect(() => {
    if (!isInitialLoad.current) {
      localStorage.setItem('resumeFormData', JSON.stringify(form));
    }
  }, [form]);

  const handleChange = (e, path) => {
    const keys = path.split('.');
    const updatedForm = { ...form };
    let obj = updatedForm;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = e.target.value;
    setForm(updatedForm);
  };

  const addExperience = () => {
    setForm(prev => ({
      ...prev,
      experience: [...prev.experience, { role: '', company: '', duration: '', description: '' }],
    }));
  };

  const removeExperience = (index) => {
    setForm(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setForm(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', link: '' }],
    }));
  };

  const removeProject = (index) => {
    setForm(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setForm(DEFAULT_FORM);
      localStorage.removeItem('resumeFormData');
    }
  };

  const handleSubmit = () => {
    router.push('/resume-preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Create Your Resume</h1>
              <p className="text-gray-600">Build a professional resume with AI-powered suggestions</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/dashboard')} 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-bold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Dashboard
            </button>
              <button 
                onClick={clearForm} 
                className="border-2 border-gray-400 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
              >
              Clear Form
            </button>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
        </svg>
        <span className="text-red-700 font-semibold">
          AI suggestions are <span className="underline">not available</span> for free templates.<br />
          For premium templates, you must have credits to use AI suggestions.
        </span>
      </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <p className="text-black">
          Template: <strong className="text-yellow-600">{template}</strong>
        </p>
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(form.personalInfo).map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-semibold text-black capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
            <input
                  placeholder={`Enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
              value={form.personalInfo[key]}
              onChange={(e) => handleChange(e, `personalInfo.${key}`)}
                  className="w-full border-2 border-gray-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
            />
              </div>
          ))}
          </div>
        </div>

        {/* AI Input Suggestions Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-8 border border-yellow-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black">AI-Powered Suggestions</h2>
          </div>
          
          <p className="text-black mb-6">Provide these details to get personalized AI suggestions for your resume</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Target Job Role</label>
    <input
      type="text"
      placeholder="e.g. Backend Developer, UI/UX Designer"
      value={form.appliedJob || ''}
      onChange={(e) => setForm(prev => ({ ...prev, appliedJob: e.target.value }))}
                className="w-full border-2 border-yellow-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
    />
  </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Experience Level</label>
    <input
      type="text"
      placeholder="e.g. Fresher, 1 year, 3+ years"
      value={form.experienceLevel || ''}
      onChange={(e) => setForm(prev => ({ ...prev, experienceLevel: e.target.value }))}
                className="w-full border-2 border-yellow-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
    />
  </div>
</div>
</div>

        {/* Summary Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Professional Summary</h2>
            </div>
    <button
      onClick={async () => {
                const jobRole = form.appliedJob || form.jobrole || "Software Engineer";
                const experienceLevel = form.experienceLevel || "";
        const res = await fetch('/api/ai/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jobRole, experienceLevel }),
        });
        const data = await res.json();
        if (data.summary) {
          setForm(prev => ({ ...prev, summary: data.summary }));
        }
      }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
    >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
      Generate with AI
    </button>
  </div>
  <textarea
    value={form.summary}
    onChange={(e) => handleChange(e, 'summary')}
            className="w-full border-2 border-gray-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
            rows={4}
    placeholder="e.g. Experienced React developer with a passion for building performant UIs..."
  />
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black">Education</h2>
          </div>
          <textarea
            value={form.education}
            onChange={(e) => handleChange(e, 'education')}
            className="w-full border-2 border-gray-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
            rows={3}
            placeholder="e.g. Bachelor of Science in Computer Science, University of Technology, 2020-2024"
          />
        </div>
        
        {/* Skills Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Skills</h2>
            </div>
            <button
              onClick={async () => {
                const jobRole = form.appliedJob || form.jobrole || "Software Engineer";
                const experienceLevel = form.experienceLevel || "";
                
                if (!jobRole) {
                  alert('Please fill in the "Target Job Role" field first');
                  return;
                }
                
                const res = await fetch('/api/ai/generate-skills', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jobRole, experienceLevel }),
                });
                const data = await res.json();
                if (data.skills) {
                  setForm(prev => ({ ...prev, skills: data.skills }));
                }
              }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate with AI
            </button>
          </div>
          <textarea
            value={form.skills}
            onChange={(e) => handleChange(e, 'skills')}
            className="w-full border-2 border-gray-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
            rows={4}
            placeholder="e.g. • Programming Languages: Java, JavaScript&#10;• Web Development: HTML5, CSS3, React.js&#10;• Back-End Frameworks: Spring Boot&#10;• Databases: PostgreSQL, MySQL"
          />
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Work Experience</h2>
            </div>
            <button 
              onClick={addExperience}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Experience
            </button>
          </div>
          
          {form.experience.map((exp, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Experience {index + 1}</h3>
                {index > 0 && (
                  <button 
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Role</label>
                  <input
                    placeholder="e.g. Software Developer"
                    value={exp.role}
                    onChange={(e) => handleChange(e, `experience.${index}.role`)}
                    className="w-full border-2 border-gray-200 bg-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Company</label>
                  <input
                    placeholder="e.g. Tech Corp"
                    value={exp.company}
                    onChange={(e) => handleChange(e, `experience.${index}.company`)}
                    className="w-full border-2 border-gray-200 bg-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Duration</label>
                  <input
                    placeholder="e.g. 2022 - Present"
                    value={exp.duration}
                    onChange={(e) => handleChange(e, `experience.${index}.duration`)}
                    className="w-full border-2 border-gray-200 bg-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-black">Description</label>
                  <button
                    onClick={async () => {
                      if (!exp.description.trim()) {
                        alert('Please enter a description first before enhancing with AI');
                        return;
                      }
                      
                      const jobRole = form.appliedJob || form.jobrole || "Software Engineer";
                      const experienceLevel = form.experienceLevel || "";
                      
                      const res = await fetch('/api/ai/quantify-experience', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          description: exp.description,
                          jobRole,
                          experienceLevel
                        }),
                      });
                      const data = await res.json();
                      if (data.quantifiedDescription) {
                        handleChange({ target: { value: data.quantifiedDescription } }, `experience.${index}.description`);
                      }
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-3 py-1 rounded-lg hover:from-yellow-600 hover:to-yellow-700 text-sm font-bold transition-all duration-200 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Enhance with AI
                  </button>
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleChange(e, `experience.${index}.description`)}
                  className="w-full border-2 border-gray-200 bg-white p-4 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
                  rows={3}
                  placeholder="e.g. Developed web applications, worked on database optimization, collaborated with team members..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Projects</h2>
            </div>
            <button 
              onClick={addProject}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Project
            </button>
          </div>
          
          {form.projects.map((proj, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">Project {index + 1}</h3>
                {index > 0 && (
                  <button 
                    onClick={() => removeProject(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Project Name</label>
                  <input
                    placeholder="e.g. E-commerce Platform"
                    value={proj.name}
                    onChange={(e) => handleChange(e, `projects.${index}.name`)}
                    className="w-full border-2 border-gray-200 bg-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black">Project Link</label>
                  <input
                    placeholder="e.g. https://github.com/username/project"
                    value={proj.link}
                    onChange={(e) => handleChange(e, `projects.${index}.link`)}
                    className="w-full border-2 border-gray-200 bg-white p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-black">Description</label>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!proj.name.trim()) {
                          alert('Please enter a project name first before generating description with AI');
                          return;
                        }
                        
                        const jobRole = form.appliedJob || form.jobrole || "Software Engineer";
                        const experienceLevel = form.experienceLevel || "";
                        
                        const res = await fetch('/api/ai/generate-project-description', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            projectTitle: proj.name,
                            jobRole,
                            experienceLevel
                          }),
                        });
                        const data = await res.json();
                        if (data.projectDescription) {
                          handleChange({ target: { value: data.projectDescription } }, `projects.${index}.description`);
                        }
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-3 py-1 rounded-lg hover:from-yellow-600 hover:to-yellow-700 text-sm font-bold transition-all duration-200 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate
                    </button>
                    <button
                      onClick={async () => {
                        if (!proj.description.trim()) {
                          alert('Please enter a description first before enhancing with AI');
                          return;
                        }
                        
                        const jobRole = form.appliedJob || form.jobrole || "Software Engineer";
                        const experienceLevel = form.experienceLevel || "";
                        
                        const res = await fetch('/api/ai/enhance-project-description', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            projectTitle: proj.name,
                            description: proj.description,
                            jobRole,
                            experienceLevel
                          }),
                        });
                        const data = await res.json();
                        if (data.enhancedDescription) {
                          handleChange({ target: { value: data.enhancedDescription } }, `projects.${index}.description`);
                        }
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-3 py-1 rounded-lg hover:from-yellow-600 hover:to-yellow-700 text-sm font-bold transition-all duration-200 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Enhance
                    </button>
                  </div>
                </div>
                <textarea
                  value={proj.description}
                  onChange={(e) => handleChange(e, `projects.${index}.description`)}
                  className="w-full border-2 border-gray-200 bg-white p-4 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200"
                  rows={3}
                  placeholder="e.g. Developed a full-stack web application using React.js and Node.js..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Achievements Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Achievements</h2>
            </div>
            <textarea
              value={form.achievements}
              onChange={(e) => handleChange(e, 'achievements')}
              className="w-full border-2 border-gray-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
              rows={4}
              placeholder="e.g. • Won 1st place in Hackathon 2023&#10;• Published 2 research papers&#10;• Led team of 5 developers"
            />
          </div>

          {/* Interests Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Interests</h2>
            </div>
            <textarea
              value={form.interests}
              onChange={(e) => handleChange(e, 'interests')}
              className="w-full border-2 border-gray-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-200 hover:border-yellow-300"
              rows={4}
              placeholder="e.g. • Open Source Contribution&#10;• Machine Learning&#10;• Reading Tech Blogs&#10;• Playing Guitar"
            />
          </div>
        </div>

        {/* Generate Resume Button */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <button
          onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-xl hover:from-yellow-600 hover:to-yellow-700 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
            🚀 Generate Your Resume
        </button>
        </div>
      </div>
    </div>
  );
}

// 🔽 Reusable Components 🔽

function Input({ label, value, onChange }) {
  return (
    <input
      placeholder={label}
      value={value}
      onChange={onChange}
      className="border border-yellow-200 bg-white p-2 rounded w-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
    />
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <h2 className="font-semibold text-black">{label}</h2>
      <textarea
        value={value}
        onChange={onChange}
        className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
        rows={3}
      />
    </div>
  );
}

function SectionList({ title, list, onAdd, onRemove, render }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mt-6">
        <h2 className="font-semibold text-black">{title}</h2>
        <button onClick={onAdd} className="text-yellow-600 hover:text-yellow-700 transition-colors">
          + Add {title}
        </button>
      </div>
      {list.map((item, index) => (
        <div key={index} className="border border-yellow-200 bg-white p-4 rounded space-y-2">
          <div className="flex justify-between">
            <h3 className="font-medium text-black">{title} {index + 1}</h3>
            {index > 0 && (
              <button onClick={() => onRemove(index)} className="text-red-600 hover:text-red-700">
                Remove
              </button>
            )}
          </div>
          {render(item, index)}
        </div>
      ))}
    </div>
  );
}

export default ResumeForm;
