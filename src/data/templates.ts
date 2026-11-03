import { TemplateStyle } from '../types/resume';

export interface TemplateDefinition {
  id: TemplateStyle;
  name: string;
  tagline: string;
  badge: string;
  atsScore: number;
  atsGrade: string;
  category: 'ATS Single-Column' | 'Executive Multi-Column';
  description: string;
  bestFor: string;
  accentColor: string;
  features: string[];
}

export const RESUME_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'executive-two-column',
    name: 'Executive Two-Column',
    tagline: 'Deep Navy & Pure White Executive Leadership Layout',
    badge: 'Recruiter Favorite',
    atsScore: 94,
    atsGrade: 'A',
    category: 'Executive Multi-Column',
    description:
      'Classic split-column layout featuring an executive Navy (#1E3A5F) sidebar with candidate photo, contact info, skill ratings, and awards, paired with a pristine white body for work history.',
    bestFor: 'C-Suite, VP, Director roles, and in-person recruiter submissions',
    accentColor: '#1E3A5F',
    features: [
      'Dual-tone 33% Navy / 67% White balance',
      'Candidate photo with customizable crop',
      'Skill dot visual rating scale',
      'Multi-page consistent branding on all pages',
    ],
  },
  {
    id: 'ats-corporate-clean',
    name: 'ATS Corporate Clean',
    tagline: 'Wall Street & Fortune 500 Linear Standard',
    badge: '100% ATS Passed',
    atsScore: 99,
    atsGrade: 'A+',
    category: 'ATS Single-Column',
    description:
      'The industry gold standard for banking, consulting, and corporate enterprise jobs. 100% single-column linear layout with solid divider rules and standardized section titles that parse flawlessly in Workday and Taleo.',
    bestFor: 'Finance, Consulting, Enterprise, Operations, and Fortune 500 portals',
    accentColor: '#0F172A',
    features: [
      '100% linear single-column reading order',
      'Bold section dividers with standard ATS headers',
      'Right-aligned dates and locations for rapid scanning',
      'Clean bullet-point formatting with quantified metrics',
    ],
  },
  {
    id: 'ats-modern-accent',
    name: 'ATS Modern Tech Accent',
    tagline: 'Contemporary Silicon Valley Engineering & Product Format',
    badge: 'High Impact',
    atsScore: 98,
    atsGrade: 'A+',
    category: 'ATS Single-Column',
    description:
      'Engineered for tech professionals, software architects, product managers, and modern startups. Combines an energetic sky-blue accent header with structured skill chips and distinct achievement badges.',
    bestFor: 'Software Engineers, Tech Leads, Product Managers, and Startups',
    accentColor: '#0284C7',
    features: [
      'Modern sky-blue header with contact badge icons',
      'Structured technical competencies & tool chips',
      'Role impact highlights with bold lead-ins',
      'Greenhouse and Lever parser optimized',
    ],
  },
  {
    id: 'ats-executive-hybrid',
    name: 'ATS Executive Hybrid',
    tagline: 'Senior Director & C-Suite High-Stakes ATS Format',
    badge: 'C-Suite Ready',
    atsScore: 97,
    atsGrade: 'A+',
    category: 'ATS Single-Column',
    description:
      'Designed for Senior Leaders, Managing Directors, and Executives. Features a prominent top credential banner, an Executive Core Competencies 3-column matrix, and dedicated Key Strategic Achievements callouts.',
    bestFor: 'Senior Directors, VPs, General Managers, and Executive Search firms',
    accentColor: '#0369A1',
    features: [
      'Executive leadership header with immediate availability badge',
      'Core competencies 3-column structured matrix',
      'Strategic career milestones and P&L achievements',
      'ATS-safe single-column hierarchy throughout',
    ],
  },
  {
    id: 'ats-single-column',
    name: 'ATS Classic Minimalist',
    tagline: 'Ultra-Clean Traditional Single-Column Format',
    badge: 'Universal Parse',
    atsScore: 100,
    atsGrade: 'A+',
    category: 'ATS Single-Column',
    description:
      'Zero-fluff, pure semantic typography optimized for legacy applicant tracking systems, government portals, and high-volume automated screening filters. Guarantees 100% field extraction accuracy.',
    bestFor: 'Government, Academic, Healthcare, and High-Volume Job Boards',
    accentColor: '#334155',
    features: [
      'Pure minimalist single-column typography',
      'Zero complex tables or nested elements',
      'Maximum parsing accuracy across all ATS generations',
      'Compact, scannable layout',
    ],
  },
];
