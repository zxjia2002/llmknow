import React from 'react';
import { Project } from '../data';

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <div className="space-y-6">
      {projects.map((project, index) => (
        <div key={project.name} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold">{project.name}</h3>
              {project.link && (
                <a 
                  href={`https://${project.link}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  {project.link}
                </a>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-2">{project.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {project.technologies.map(tech => (
              <span 
                key={tech} 
                className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Projects; 