'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from "@/components/Navbar";

const DEFAULT_FORM = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  experience: [
    {
      role: '',
      company: '',
      duration: '',
      description: '',
    },
  ],
  education: '',
  skills: '',
  achievements: '',
  projects: [
    {
      name: '',
      description: '',
      link: '',
    },
  ],
  interests:'',
};


export default function ResumeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [template, setTemplate] = useState('single-column');

  const isInitialLoad = useRef(true); // 👈🏽 flag to run load logic only once

  useEffect(() => {
    if (isInitialLoad.current) {
      const savedForm = localStorage.getItem('resumeFormData');
      const savedTemplate = localStorage.getItem('resumeTemplate');

      if (savedForm) setForm(JSON.parse(savedForm));
      if (savedTemplate) setTemplate(savedTemplate);

      isInitialLoad.current = false;
    }
  }, []);

  // Read query param for template
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam === 'minimalist' || templateParam === 'sidebar-elegance') {
      setTemplate(templateParam);
      localStorage.setItem('resumeTemplate', templateParam);
    }
  }, [searchParams]);

  // Always update form in localStorage
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
    setForm((prev) => ({
      ...prev,
      experience: [...prev.experience, { role: '', company: '', duration: '', description: '' }],
    }));
  };

  const removeExperience = (index) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', link: '' }],
    }));
  };

  const removeProject = (index) => {
    setForm((prev) => ({
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Create Resume</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push('/dashboard')} className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 transition-colors font-semibold">
              Go to Dashboard
            </button>
            <button onClick={clearForm} className="bg-red text-red-500 px-4 py-2 rounded hover:bg-red-100 transition-colors font-semibold">
              Clear Form
            </button>
          </div>
        </div>

        <p className="text-black">
          Template: <strong className="text-yellow-600">{template}</strong>
        </p>

        {/* Personal Info */}
        <div className="grid grid-cols-2 gap-4">
        {Object.keys(form.personalInfo).filter(key => key !== 'location').map((key) => (
            <input
              key={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={form.personalInfo[key]}
              onChange={(e) => handleChange(e, `personalInfo.${key}`)}
              className="border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            />
          ))}
        </div>

        {/* Summary */}
        <div>
          <h2 className="font-semibold text-black">Summary</h2>
          <textarea
            value={form.summary}
            onChange={(e) => handleChange(e, 'summary')}
            className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            rows={3}
          />
        </div>

        {/* Education */}
        <div>
          <h2 className="font-semibold text-black">Education</h2>
          <textarea
            value={form.education}
            onChange={(e) => handleChange(e, 'education')}
            className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            rows={3}
          />
        </div>

        {/* Skills */}
        <div>
          <h2 className="font-semibold text-black">Skills</h2>
          <textarea
            value={form.skills}
            onChange={(e) => handleChange(e, 'skills')}
            className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            rows={3}
          />
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-black">Experience</h2>
            <button onClick={addExperience} className="text-yellow-600 hover:text-yellow-700 transition-colors">
              + Add Experience
            </button>
          </div>

          {form.experience.map((exp, index) => (
            <div key={index} className="border border-yellow-200 bg-white p-4 rounded space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium text-black">Experience {index + 1}</h3>
                {index > 0 && (
                  <button onClick={() => removeExperience(index)} className="text-red-600 hover:text-red-700 transition-colors">
                    Remove
                  </button>
                )}
              </div>
              <input
                placeholder="Role"
                value={exp.role}
                onChange={(e) => handleChange(e, `experience.${index}.role`)}
                className="border border-yellow-200 bg-white p-2 rounded w-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />
              <input
                placeholder="Company"
                value={exp.company}
                onChange={(e) => handleChange(e, `experience.${index}.company`)}
                className="border border-yellow-200 bg-white p-2 rounded w-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />
              <input
                placeholder="Duration"
                value={exp.duration}
                onChange={(e) => handleChange(e, `experience.${index}.duration`)}
                className="border border-yellow-200 bg-white p-2 rounded w-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />
              <textarea
                placeholder="Description"
                value={exp.description}
                onChange={(e) => handleChange(e, `experience.${index}.description`)}
                className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                rows={3}
              />
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mt-6">
            <h2 className="font-semibold text-black">Projects</h2>
            <button onClick={addProject} className="text-yellow-600 hover:text-yellow-700 transition-colors">
              + Add Project
            </button>
          </div>

          {form.projects.map((proj, index) => (
            <div key={index} className="border border-yellow-200 bg-white p-4 rounded space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium text-black">Project {index + 1}</h3>
                {index > 0 && (
                  <button onClick={() => removeProject(index)} className="text-red-600 hover:text-red-700 transition-colors">
                    Remove
                  </button>
                )}
              </div>
              <input
                placeholder="Project Name"
                value={proj.name}
                onChange={(e) => handleChange(e, `projects.${index}.name`)}
                className="border border-yellow-200 bg-white p-2 rounded w-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />
              <textarea
                placeholder="Description"
                value={proj.description}
                onChange={(e) => handleChange(e, `projects.${index}.description`)}
                className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                rows={3}
              />
              <input
                placeholder="Link"
                value={proj.link}
                onChange={(e) => handleChange(e, `projects.${index}.link`)}
                className="border border-yellow-200 bg-white p-2 rounded w-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div>
          <h2 className="font-semibold text-black">Achievements</h2>
          <textarea
            value={form.achievements}
            onChange={(e) => handleChange(e, 'achievements')}
            className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            rows={3}
          />
        </div>

        {/* Interests */}
        <div>
          <h2 className="font-semibold text-black">Interests</h2>
          <textarea
            value={form.interests}
            onChange={(e) => handleChange(e, 'interests')}
            className="w-full border border-yellow-200 bg-white p-2 rounded focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-500 text-black py-2 rounded mt-6 hover:bg-yellow-600 transition-colors font-semibold"
        >
          Generate Resume
        </button>
      </div>
    </div>
  );
}
