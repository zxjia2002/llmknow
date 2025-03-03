import React from 'react';
import { Link } from 'react-router-dom';
import { resumeData } from '../data';
import SearchChat from '../components/SearchChat';

export default function Resume() {
  return (
    <div className="min-h-screen bg-geist-background text-geist-foreground">
      {/* Search Chat */}
      <div className="sticky top-0 z-10 bg-geist-background/80 backdrop-blur-sm border-b border-geist-border">
        <div className="max-w-4xl mx-auto py-4 px-4">
          <SearchChat />
        </div>
      </div>

      {/* Header Section */}
      <header className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-4">{resumeData.name}</h1>
        <p className="text-xl text-geist-secondary mb-6">{resumeData.title}</p>
        <p className="text-geist-secondary mb-6">{resumeData.summary}</p>
        <div className="flex gap-4">
          <a href={`mailto:${resumeData.email}`} className="text-geist-primary hover:text-geist-primary-dark">
            {resumeData.email}
          </a>
          <a href={resumeData.linkedin} target="_blank" rel="noopener noreferrer" className="text-geist-primary hover:text-geist-primary-dark">
            LinkedIn
          </a>
          <a href={resumeData.github} target="_blank" rel="noopener noreferrer" className="text-geist-primary hover:text-geist-primary-dark">
            GitHub
          </a>
        </div>
      </header>

      {/* Skills Section */}
      <section className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold mb-6">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Technical Skills</h3>
            <div className="grid grid-cols-2 gap-4">
              {resumeData.skills.technical.map((skill, index) => (
                <div key={index} className="p-3 bg-geist-surface rounded-lg">
                  {skill}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Soft Skills</h3>
            <div className="grid grid-cols-2 gap-4">
              {resumeData.skills.soft.map((skill, index) => (
                <div key={index} className="p-3 bg-geist-surface rounded-lg">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold mb-6">Experience</h2>
        <div className="space-y-8">
          {resumeData.experience.map((job, index) => (
            <div key={index} className="p-6 bg-geist-surface rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium">{job.company}</h3>
                  <p className="text-geist-secondary">{job.title}</p>
                </div>
                <span className="text-sm text-geist-secondary">{job.period}</span>
              </div>
              <ul className="list-disc list-inside space-y-2">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-geist-secondary">{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-semibold mb-6">Education</h2>
        <div className="space-y-6">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="p-6 bg-geist-surface rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-medium">{edu.institution}</h3>
                <span className="text-sm text-geist-secondary">{edu.period}</span>
              </div>
              <p className="text-geist-secondary">{edu.degree}</p>
              {edu.details && (
                <p className="mt-2 text-geist-secondary">{edu.details}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-4xl mx-auto py-8 px-4 mb-16">
        <h2 className="text-2xl font-semibold mb-6">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeData.projects.map((project, index) => (
            <div key={index} className="p-6 bg-geist-surface rounded-lg">
              <h3 className="text-xl font-medium mb-2">{project.name}</h3>
              <p className="text-geist-secondary mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-geist-background rounded text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chat Link */}
      <Link
        to="/chat"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-geist-foreground text-geist-background rounded-full shadow-lg hover:bg-geist-foreground/90 transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
        >
          <path
            d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14ZM9 5H7V7H5V9H7V11H9V9H11V7H9V5Z"
            fill="currentColor"
          />
        </svg>
        Open Chat
      </Link>
    </div>
  );
} 