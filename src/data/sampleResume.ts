import { ResumeData } from '../types/resume';

const syntheticAvatarSvg =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%230369a1'/><stop offset='50%' stop-color='%230f172a'/><stop offset='100%' stop-color='%230284c7'/></linearGradient></defs><rect width='200' height='200' fill='url(%23g)'/><circle cx='100' cy='75' r='36' fill='%23f1f5f9'/><path d='M35 185 c0 -36 29 -65 65 -65 s65 29 65 65 Z' fill='%23cbd5e1'/></svg>";

/**
 * Synthetic Demo Resume
 * 100% fictitious synthetic dataset for previewing, testing, and demonstrating the resume engine.
 * Completely replaces any legacy sample profiles.
 */
export const syntheticDemoResume: ResumeData = {
  personal: {
    fullName: 'ALEX MORGAN',
    headline: 'Senior Director of Technology & Digital Products',
    photoUrl: syntheticAvatarSvg,
    photoShape: 'square',
    photoFit: 'cover',
    photoPosition: 'center',
    photoAlignment: 'left',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    passportNo: 'P9823411',
    nationality: 'United States',
    visaStatus: 'Citizen',
    availability: 'AVAILABLE WITH 2 WEEKS NOTICE',
    linkedin: 'linkedin.com/in/alexmorgan-demo',
    website: 'alexmorgan-tech.example.com',
  },
  summary:
    'Results-driven Technology & Product Director with 10+ years of progressive leadership directing cross-functional software engineering, cloud architecture, and multi-platform enterprise products (B2B SaaS and consumer mobile). Proven record of scaling modern cloud infrastructure, reducing operational expenditure by 22%, and leading high-velocity global engineering teams.',
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Senior Director of Engineering',
      company: 'Apex Global Technologies',
      location: 'San Francisco, CA',
      duration: 'Jan 2021 - Present',
      highlights: [
        'Direct global engineering teams (35+ engineers and tech leads) across cloud infrastructure, distributed microservices, and core platform reliability.',
        'Formulate multi-year technology roadmaps, technical debt mitigation strategies, and zero-trust security governance frameworks.',
      ],
      achievements: [
        'Spearheaded enterprise cloud migration to automated multi-region Kubernetes, reducing infrastructure OPEX by 22% with 99.99% uptime SLA.',
        'Architected real-time event streaming pipeline processing 15M+ daily transactions with sub-second latency.',
      ],
    },
    {
      id: 'exp-2',
      jobTitle: 'Lead Technical Product Manager',
      company: 'Vanguard Cloud Systems',
      location: 'San Jose, CA',
      duration: 'May 2018 - Dec 2020',
      highlights: [
        'Led cross-functional product development for flagship B2B analytics platform across Web, iOS, and Android applications.',
        'Collaborated directly with enterprise clients, UX research, and executive stakeholders to author PRDs and roadmap milestones.',
      ],
      achievements: [
        'Scaled SaaS platform from 120k to over 1.2M active monthly users within 18 months, contributing to $14M ARR growth.',
        'Introduced automated AI recommendation workflows that improved customer product engagement metrics by 28%.',
      ],
    },
    {
      id: 'exp-3',
      jobTitle: 'Senior Software Operations Manager',
      company: 'Horizon Digital Media',
      location: 'Seattle, WA',
      duration: 'Aug 2014 - Apr 2018',
      highlights: [
        'Managed end-to-end continuous delivery pipelines, DevOps automation, and ITIL incident/change management workflows.',
        'Orchestrated multi-tier technical escalation protocols and vendor SLA compliance audits for global client services.',
      ],
      achievements: [
        'Engineered continuous deployment automation that slashed release cycle times from 14 days down to twice-weekly sprints.',
        'Awarded Corporate Engineering Excellence Award for sustaining 99.7% customer satisfaction ratings over 3 consecutive years.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      school: 'California Institute of Technology',
      degree: 'Bachelor of Science in Computer Science',
      duration: '2010 - 2014',
    },
    {
      id: 'edu-2',
      school: 'Stanford Executive Education',
      degree: 'Executive Certificate in Strategic Technology Leadership',
      duration: '2019',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'Cloud Architecture & AWS', rating: 5 },
    { id: 'sk-2', name: 'Agile Engineering Management', rating: 5 },
    { id: 'sk-3', name: 'Enterprise IT Governance', rating: 4 },
    { id: 'sk-4', name: 'Strategic Roadmap Planning', rating: 5 },
    { id: 'sk-5', name: 'Distributed Systems & Microservices', rating: 4 },
    { id: 'sk-6', name: 'FinOps & Cost Optimization', rating: 4 },
    { id: 'sk-7', name: 'Executive Stakeholder Alignment', rating: 5 },
  ],
  awards: [
    {
      id: 'aw-1',
      title: 'Enterprise Engineering Excellence Award',
      years: '(2023)',
    },
    {
      id: 'aw-2',
      title: 'Cloud Innovation Milestone Recognition',
      years: '(2020)',
    },
  ],
};


/**
 * Pristine blank resume model for initial load and reset
 */
export const emptyResume: ResumeData = {
  personal: {
    fullName: '',
    headline: '',
    photoUrl: '',
    photoShape: 'square',
    photoFit: 'cover',
    photoPosition: 'top',
    photoAlignment: 'left',
    email: '',
    phone: '',
    location: '',
    passportNo: '',
    nationality: '',
    visaStatus: '',
    availability: '',
    linkedin: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  awards: [],
};
