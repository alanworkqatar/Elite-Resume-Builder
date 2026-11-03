import { ResumeData, WorkExperience } from './resume';

export type IngestionSourceType = 'pasted' | 'pdf' | 'docx';

export interface JobDescriptionData {
  jobTitle: string;
  company: string;
  location?: string;
  department?: string;
  seniority?: string;
  employmentType?: string;
  rawText: string;
  sourceType: IngestionSourceType;
  fileName?: string;
  summary: string;
  mandatorySkills: string[];
  preferredSkills: string[];
  coreResponsibilities: string[];
  qualifications: string[];
  implicitPriorities: string[]; // Clearly identified as AI-inferred priorities
}

export type MatchClassification =
  | 'direct_match'
  | 'transferable_match'
  | 'partial_match'
  | 'not_documented'
  | 'confirmation_required';

export interface RequirementMatchItem {
  id: string;
  category: 'experience' | 'skills' | 'responsibilities' | 'qualifications' | 'industry' | 'seniority';
  requirement: string;
  importance: 'mandatory' | 'preferred' | 'bonus';
  matchType: MatchClassification;
  candidateEvidence: string;
  sourceRole?: string;
  sourceField?: string;
  confidenceScore: number; // 0 to 100
  suggestedResumeTreatment: string;
}

export interface MatchScoreWeights {
  experience: number; // default 30
  skills: number; // default 25
  responsibilities: number; // default 20
  qualifications: number; // default 10
  industry: number; // default 10
  seniority: number; // default 5
}

export interface PositioningStrategy {
  recommendedHeadline: string;
  positioningAngle: string;
  priorityExperiences: string[];
  emphasizedSkills: string[];
  deemphasizedSkills: string[];
  strategicRationale: string;
}

export interface JobMatchAnalysis {
  overallAlignmentScore: number; // 0 to 100
  categoryScores: {
    experience: number;
    skills: number;
    responsibilities: number;
    qualifications: number;
    industry: number;
    seniority: number;
  };
  weights: MatchScoreWeights;
  requirements: RequirementMatchItem[];
  strengths: string[];
  missingRequirements: string[];
  confirmationItems: string[];
  positioningStrategy: PositioningStrategy;
}

export type ClaimStatus = 'VERIFIED' | 'NEEDS CONFIRMATION' | 'UNSUPPORTED';

export interface ClaimVerificationItem {
  id: string;
  claimText: string;
  targetSection: 'headline' | 'summary' | 'experience' | 'skills' | 'cover_letter';
  sourceRole?: string;
  sourceField: string;
  originalSourceText: string;
  status: ClaimStatus;
  isAiModifiedWording: boolean;
  userConfirmed?: boolean;
}

export type DiffChangeType = 'added' | 'rewritten' | 'reordered' | 'shortened' | 'removed';

export interface DiffChangeItem {
  id: string;
  section: 'headline' | 'summary' | 'experience' | 'skills';
  roleId?: string;
  changeType: DiffChangeType;
  originalText: string;
  tailoredText: string;
  reason: string;
  accepted: boolean;
}

export interface CoverLetterData {
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  jobTitle: string;
  date: string;
  tone: 'executive' | 'persuasive' | 'concise';
  length: 'short' | 'standard'; // short: 150-180w, standard: 250-300w
  openingParagraph: string;
  relevanceParagraph: string;
  evidenceParagraph: string;
  employerFitParagraph: string;
  closingParagraph: string;
}

export type ApplicationStatus =
  | 'not_applied'
  | 'ready_to_apply'
  | 'applied'
  | 'interview'
  | 'rejected'
  | 'offer_received';

export interface JobApplicationRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  jobDescription: JobDescriptionData;
  matchAnalysis: JobMatchAnalysis;
  tailoredResume: ResumeData;
  coverLetter: CoverLetterData;
  diffChanges: DiffChangeItem[];
  claims: ClaimVerificationItem[];
}
