import React from 'react';
import { Experience as ExperienceType } from '../data';

interface ExperienceProps {
  experiences: ExperienceType[];
}

const Experience: React.FC<ExperienceProps> = ({ experiences }) => {
  // Format date to display nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return dateString === 'Present' ? 'Present' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-6">
      {experiences.map((experience, index) => (
        <div key={`${experience.company}-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold">{experience.position}</h3>
              <h4 className="text-lg text-blue-600">{experience.company}</h4>
            </div>
            <div className="text-gray-600 text-sm">
              {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
            </div>
          </div>
          
          <p className="text-gray-700 mb-2">{experience.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {experience.technologies.map(tech => (
              <span 
                key={tech} 
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
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

export default Experience; 