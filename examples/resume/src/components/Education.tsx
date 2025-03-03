import React from 'react';
import { Education as EducationType } from '../data';

interface EducationProps {
  education: EducationType[];
}

const Education: React.FC<EducationProps> = ({ education }) => {
  return (
    <div className="space-y-6">
      {education.map((edu, index) => (
        <div key={`${edu.institution}-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold">{edu.institution}</h3>
              <h4 className="text-lg text-gray-700">
                {edu.degree} in {edu.field}
              </h4>
            </div>
            <div className="text-gray-600 text-sm">
              {edu.startDate} - {edu.endDate}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Education; 