export interface PersonalDetails {
  fullName: string;
  headline: string;
  photoUrl: string;
  photoShape?: 'square' | 'rounded' | 'circle';
  photoFit?: 'cover' | 'contain';
  photoPosition?: 'top' | 'center';
  photoAlignment?: 'left' | 'center' | 'right';
  email: string;
  phone: string;
  location: string;
  passportNo?: string;
  nationality?: string;
  visaStatus?: string;
  availability: string; // e.g. "CAN JOIN IMMEDIATELY"
  linkedin?: string;
  website?: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  duration: string; // e.g. "Sep 2019 - Dec 2020"
  highlights: string[]; // Key responsibilities / bullet points
  achievements: string[]; // Specific achievements
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  duration: string; // e.g. "Jun 2002 - Jun 2007"
  location?: string;
  details?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  rating: number; // 1 to 5 dots
}

export interface AwardItem {
  id: string;
  title: string;
  years: string; // e.g. "(2011-2012)" or "2019"
  organization?: string;
}

export interface ResumeData {
  personal: PersonalDetails;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillItem[];
  awards: AwardItem[];
}

export type TemplateStyle =
  | 'executive-two-column'
  | 'ats-corporate-clean'
  | 'ats-modern-accent'
  | 'ats-executive-hybrid'
  | 'ats-single-column';
