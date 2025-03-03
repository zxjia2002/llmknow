import React from 'react';
import { InlineChat, StandaloneChat } from '@llmknow/web';
import { resumeData, additionalInfo } from './data';
import Header from './components/Header';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Education from './components/Education';
import Projects from './components/Projects';

const App: React.FC = () => {
  // Configure the chat engine
  const engineConfig = {
    systemPrompt: `You are an AI assistant for ${resumeData.name}, a ${resumeData.title}. 
    You have access to information about their skills, experience, and projects.
    Answer questions about ${resumeData.name}'s professional background based on the provided context.
    If asked about something not in the context, politely explain that you only have information about their professional skills and experience.
    Be concise, helpful, and professional in your responses.`,
  };

  return (
    <div className="resume-container">
      <Header 
        name={resumeData.name}
        title={resumeData.title}
        contact={resumeData.contact}
        summary={resumeData.summary}
      />

      <section id="skills" className="section section-with-chat" data-context={`
        Skills section:
        ${resumeData.skills.map(skill => `${skill.name} (Level: ${skill.level}/${5})`).join(', ')}
        
        Additional skill details:
        ${Object.entries(additionalInfo.skills).map(([skill, details]) => `${skill}: ${details}`).join('\n')}
      `}>
        <h2 className="text-2xl font-bold mb-4">Skills</h2>
        <Skills skills={resumeData.skills} />
        
        <InlineChat
          mode="inline"
          position="right"
          width="350px"
          height="300px"
          enableContext={true}
          engineConfig={engineConfig}
          contextSelector="[data-context]"
        />
      </section>

      <section id="experience" className="section" data-context={`
        Work Experience:
        ${resumeData.experiences.map(exp => `
          Company: ${exp.company}
          Position: ${exp.position}
          Period: ${exp.startDate} to ${exp.endDate}
          Description: ${exp.description}
          Technologies: ${exp.technologies.join(', ')}
          
          Additional details:
          ${additionalInfo.experiences[exp.company] || ''}
        `).join('\n\n')}
      `}>
        <h2 className="text-2xl font-bold mb-4">Experience</h2>
        <Experience experiences={resumeData.experiences} />
      </section>

      <section id="education" className="section" data-context={`
        Education:
        ${resumeData.education.map(edu => `
          Institution: ${edu.institution}
          Degree: ${edu.degree} in ${edu.field}
          Period: ${edu.startDate} to ${edu.endDate}
        `).join('\n\n')}
      `}>
        <h2 className="text-2xl font-bold mb-4">Education</h2>
        <Education education={resumeData.education} />
      </section>

      <section id="projects" className="section" data-context={`
        Projects:
        ${resumeData.projects.map(project => `
          Name: ${project.name}
          Description: ${project.description}
          Technologies: ${project.technologies.join(', ')}
          Link: ${project.link || 'N/A'}
        `).join('\n\n')}
      `}>
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        <Projects projects={resumeData.projects} />
      </section>

      <StandaloneChat
        mode="standalone"
        theme="system"
        width="400px"
        height="600px"
        enableHistory={true}
        engineConfig={engineConfig}
      />
    </div>
  );
};

export default App; 