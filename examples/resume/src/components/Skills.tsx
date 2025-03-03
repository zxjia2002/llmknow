import React from 'react';
import { Skill } from '../data';

interface SkillsProps {
  skills: Skill[];
}

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  // Group skills by category
  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  // Render skill with level dots
  const renderSkillLevel = (level: number, maxLevel: number = 5) => {
    return (
      <div className="skill-level">
        {Array.from({ length: maxLevel }).map((_, index) => (
          <div
            key={index}
            className={`skill-dot ${index < level ? 'filled' : ''}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(groupedSkills).map(([category, categorySkills]) => (
        <div key={category} className="mb-4">
          <h3 className="text-lg font-semibold capitalize mb-3">{category}</h3>
          <div className="space-y-2">
            {categorySkills.map(skill => (
              <div key={skill.name} className="flex justify-between items-center">
                <span>{skill.name}</span>
                {renderSkillLevel(skill.level)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skills; 