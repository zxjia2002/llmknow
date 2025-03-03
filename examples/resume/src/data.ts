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
  email: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: Experience[];
  education: Education[];
  projects: Project[];
}

// Sample resume data
export const resumeData = {
  name: "Alex Chen",
  title: "Senior Full Stack Developer",
  email: "alex.chen@example.com",
  linkedin: "https://linkedin.com/in/alexchen",
  github: "https://github.com/alexchen",
  summary: "Experienced full-stack developer with 8+ years of expertise in building scalable web applications. Passionate about clean code, performance optimization, and modern development practices. Proven track record of leading teams and delivering complex projects.",
  
  skills: {
    technical: [
      "React, Next.js, Vue.js",
      "Node.js, Express, NestJS",
      "TypeScript, JavaScript (ES6+)",
      "Python, Django, FastAPI",
      "PostgreSQL, MongoDB, Redis",
      "AWS, Docker, Kubernetes",
      "GraphQL, REST APIs",
      "CI/CD, GitHub Actions",
      "Testing (Jest, Cypress)",
      "Performance Optimization",
    ],
    soft: [
      "Team Leadership",
      "Technical Mentoring",
      "Project Management",
      "Agile/Scrum",
      "Problem Solving",
      "Communication",
    ],
  },

  experience: [
    {
      company: "TechCorp Inc.",
      title: "Senior Full Stack Developer",
      period: "2020 - Present",
      responsibilities: [
        "Lead a team of 6 developers in building and maintaining a high-traffic e-commerce platform serving 1M+ monthly users",
        "Architected and implemented microservices architecture using Node.js and Docker, improving system reliability by 40%",
        "Introduced TypeScript and modern testing practices, reducing production bugs by 60%",
        "Mentored junior developers and conducted technical interviews",
      ],
    },
    {
      company: "WebSolutions LLC",
      title: "Full Stack Developer",
      period: "2017 - 2020",
      responsibilities: [
        "Developed and maintained multiple client projects using React, Node.js, and PostgreSQL",
        "Implemented real-time features using WebSocket and Redis, handling 100K+ concurrent connections",
        "Optimized front-end performance, achieving 40% faster page load times",
        "Collaborated with UX designers to implement responsive and accessible interfaces",
      ],
    },
    {
      company: "StartupTech",
      title: "Junior Developer",
      period: "2015 - 2017",
      responsibilities: [
        "Built and maintained features for a SaaS platform using Vue.js and Django",
        "Implemented automated testing and CI/CD pipelines",
        "Contributed to API design and documentation",
        "Participated in code reviews and agile ceremonies",
      ],
    },
  ],

  education: [
    {
      institution: "University of Technology",
      degree: "Master of Science in Computer Science",
      period: "2013 - 2015",
      details: "Specialized in Distributed Systems and Cloud Computing",
    },
    {
      institution: "State University",
      degree: "Bachelor of Science in Software Engineering",
      period: "2009 - 2013",
      details: "Graduated with Honors, Minor in Mathematics",
    },
  ],

  projects: [
    {
      name: "LLMKnow Component Library",
      description: "A modern React component library for building AI-powered chat interfaces with support for streaming responses and context awareness.",
      technologies: ["React", "TypeScript", "Zustand", "CSS Modules"],
    },
    {
      name: "E-commerce Dashboard",
      description: "Real-time analytics dashboard for e-commerce platforms with advanced filtering and visualization capabilities.",
      technologies: ["Next.js", "D3.js", "GraphQL", "PostgreSQL"],
    },
    {
      name: "Cloud Cost Optimizer",
      description: "AWS cost optimization tool that analyzes resource usage and provides recommendations for cost reduction.",
      technologies: ["Python", "AWS SDK", "React", "serverless"],
    },
    {
      name: "DevOps Pipeline Generator",
      description: "CLI tool for generating customized CI/CD pipelines with best practices for various tech stacks.",
      technologies: ["Node.js", "Docker", "GitHub Actions", "Jest"],
    },
  ],
};

// Additional information for skills and experiences
export const additionalInfo = {
  skills: {
    "React & Frontend": "8+ years of experience with React and modern frontend development. Implemented complex UIs, state management solutions, and performance optimizations. Strong focus on component reusability and maintainability.",
    "Backend & APIs": "Extensive experience in designing and implementing scalable backend services. Proficient in RESTful and GraphQL APIs, microservices architecture, and database optimization.",
    "DevOps & Cloud": "Strong background in AWS services, containerization, and CI/CD. Implemented infrastructure as code and automated deployment pipelines for multiple projects.",
    "Team Leadership": "Led multiple development teams, conducted technical interviews, and mentored junior developers. Strong communication and project management skills.",
  },
  experience: {
    "TechCorp Inc.": "Led the modernization of a legacy e-commerce platform to a microservices architecture. Implemented event-driven architecture using Apache Kafka and implemented real-time inventory management system.",
    "WebSolutions LLC": "Specialized in building high-performance web applications for clients in fintech and healthcare sectors. Implemented HIPAA-compliant data handling and real-time collaboration features.",
    "StartupTech": "Early employee at a B2B SaaS startup. Contributed to product development from initial MVP to a mature platform serving 50K+ users.",
  },
  projects: {
    "LLMKnow": "Open-source project with 1000+ GitHub stars. Features include streaming responses, context awareness, and customizable UI components.",
    "E-commerce Dashboard": "Processes 1M+ daily transactions in real-time. Reduced average query time from 2s to 200ms through optimization.",
    "Cloud Cost Optimizer": "Helped clients achieve 30-50% cost reduction in AWS infrastructure spending.",
    "DevOps Pipeline Generator": "Used by 100+ companies to standardize their CI/CD processes. Supports multiple cloud providers and tech stacks.",
  },
}; 