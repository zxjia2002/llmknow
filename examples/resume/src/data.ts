export interface Skill {
  name: string;
  level: number; // 1-5
  category: 'frontend' | 'backend' | 'devops' | 'other';
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  technologies: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  summary: string;
  contact: {
    email: string;
    phone?: string;
    location: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  projects: Project[];
}

// Sample resume data
export const resumeData: ResumeData = {
  name: "Alex Chen",
  title: "Senior Frontend Engineer",
  summary: "Experienced frontend engineer with expertise in building interactive web applications and component libraries. Specialized in React, TypeScript, and modern frontend architecture.",
  contact: {
    email: "alex.chen@example.com",
    location: "San Francisco, CA",
    github: "github.com/alexchen",
    linkedin: "linkedin.com/in/alexchen",
    website: "alexchen.dev"
  },
  skills: [
    { name: "React", level: 5, category: "frontend" },
    { name: "TypeScript", level: 5, category: "frontend" },
    { name: "JavaScript", level: 5, category: "frontend" },
    { name: "HTML/CSS", level: 4, category: "frontend" },
    { name: "Tailwind CSS", level: 4, category: "frontend" },
    { name: "Redux", level: 4, category: "frontend" },
    { name: "Next.js", level: 4, category: "frontend" },
    { name: "Node.js", level: 3, category: "backend" },
    { name: "GraphQL", level: 3, category: "backend" },
    { name: "Webpack/Rspack", level: 4, category: "devops" },
    { name: "Jest/Vitest", level: 4, category: "devops" },
    { name: "CI/CD", level: 3, category: "devops" },
  ],
  experiences: [
    {
      company: "TechCorp Inc.",
      position: "Senior Frontend Engineer",
      startDate: "2020-01",
      endDate: "Present",
      description: "Lead the development of the company's component library and design system. Implemented advanced UI patterns and optimized performance for large-scale applications.",
      technologies: ["React", "TypeScript", "Redux", "Tailwind CSS", "Storybook"]
    },
    {
      company: "WebSolutions LLC",
      position: "Frontend Developer",
      startDate: "2017-06",
      endDate: "2019-12",
      description: "Developed responsive web applications for enterprise clients. Collaborated with designers and backend engineers to deliver high-quality products.",
      technologies: ["React", "JavaScript", "SCSS", "REST API"]
    }
  ],
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2013",
      endDate: "2017"
    }
  ],
  projects: [
    {
      name: "LLMKnow Component Library",
      description: "Designed and implemented a versatile chat component library that supports both inline and standalone chat interfaces. Features include streaming responses, code highlighting, and context management.",
      technologies: ["React", "TypeScript", "Zustand", "Rspack", "Vanilla Extract CSS"],
      link: "github.com/alexchen/llmknow"
    },
    {
      name: "E-commerce Dashboard",
      description: "Built a real-time dashboard for e-commerce analytics with interactive charts and filtering capabilities.",
      technologies: ["React", "D3.js", "GraphQL", "Material UI"],
      link: "github.com/alexchen/ecommerce-dashboard"
    }
  ]
};

// Additional information for skills and experiences
export const additionalInfo = {
  skills: {
    "React": "I have 5+ years of experience with React, building complex applications and component libraries. I'm proficient with hooks, context, and advanced patterns like render props and HOCs.",
    "TypeScript": "I use TypeScript in all my projects to ensure type safety and improve developer experience. I'm experienced with advanced TypeScript features like generics, utility types, and declaration merging.",
    "Tailwind CSS": "I prefer Tailwind for styling due to its utility-first approach. I've created custom design systems extending Tailwind's configuration.",
    "Next.js": "I've built several production applications with Next.js, leveraging its SSR, SSG, and ISR capabilities for optimal performance and SEO.",
    "GraphQL": "I've implemented GraphQL APIs using Apollo Server and consumed them with Apollo Client in React applications."
  },
  experiences: {
    "TechCorp Inc.": "At TechCorp, I led a team of 5 engineers to create a component library used by 20+ internal projects. The library reduced development time by 40% and ensured UI consistency across all products.",
    "WebSolutions LLC": "During my time at WebSolutions, I optimized a client's web application, improving load time by 60% and achieving a perfect Lighthouse score."
  }
}; 