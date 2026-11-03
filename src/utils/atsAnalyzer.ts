import { ResumeData } from '../types/resume';

export interface AtsCheckResult {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'tip';
  points: number;
  maxPoints: number;
}

export interface AtsAnalysis {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Improvement';
  checks: AtsCheckResult[];
  detectedMetricsCount: number;
  detectedActionVerbsCount: number;
  skillsCount: number;
  wordCount: number;
  recommendations: string[];
}

const ACTION_VERBS = [
  'led', 'managed', 'spearheaded', 'orchestrated', 'directed', 'engineered', 'developed',
  'designed', 'architected', 'implemented', 'optimized', 'accelerated', 'transformed',
  'achieved', 'delivered', 'generated', 'increased', 'decreased', 'reduced', 'saved',
  'negotiated', 'streamlined', 'supervised', 'championed', 'established', 'expanded',
  'founded', 'overhauled', 'boosted', 'scaled', 'mentored', 'executed'
];

export function analyzeResumeForAts(data: ResumeData): AtsAnalysis {
  const checks: AtsCheckResult[] = [];
  const p = data.personal || {};
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];

  // Check 1: Full Name & Headline
  const hasName = Boolean(p.fullName && p.fullName.trim().length > 2);
  const hasHeadline = Boolean(p.headline && p.headline.trim().length > 3);
  if (hasName && hasHeadline) {
    checks.push({
      id: 'name_headline',
      title: 'Full Name & Professional Headline',
      description: 'Clear candidate identity and target job title detected for ATS matching.',
      status: 'passed',
      points: 15,
      maxPoints: 15,
    });
  } else if (hasName) {
    checks.push({
      id: 'name_headline',
      title: 'Full Name Present (Headline Recommended)',
      description: 'Adding a targeted professional headline improves ATS keyword indexing.',
      status: 'warning',
      points: 10,
      maxPoints: 15,
    });
  } else {
    checks.push({
      id: 'name_headline',
      title: 'Missing Full Name',
      description: 'Candidate name is required for any ATS to index the profile.',
      status: 'warning',
      points: 0,
      maxPoints: 15,
    });
  }

  // Check 2: Contact Information (Email, Phone, Location)
  const hasEmail = Boolean(p.email && p.email.includes('@'));
  const hasPhone = Boolean(p.phone && p.phone.trim().length > 5);
  const hasLocation = Boolean(p.location && p.location.trim().length > 2);
  const contactFields = [hasEmail, hasPhone, hasLocation].filter(Boolean).length;

  if (contactFields === 3) {
    checks.push({
      id: 'contact_info',
      title: 'Standard Contact Coordinates',
      description: 'Email, Phone number, and Location are formatted for instant parsing.',
      status: 'passed',
      points: 15,
      maxPoints: 15,
    });
  } else {
    checks.push({
      id: 'contact_info',
      title: 'Incomplete Contact Details',
      description: 'Ensure Email, Phone, and Location are all populated.',
      status: 'warning',
      points: contactFields * 4,
      maxPoints: 15,
    });
  }

  // Check 3: Professional Summary
  const summaryLength = (data.summary || '').trim().split(/\s+/).filter(Boolean).length;
  if (summaryLength >= 25 && summaryLength <= 100) {
    checks.push({
      id: 'summary',
      title: 'Executive Professional Summary',
      description: `Well-calibrated summary (${summaryLength} words) with strong context for automated matchers.`,
      status: 'passed',
      points: 15,
      maxPoints: 15,
    });
  } else if (summaryLength > 0) {
    checks.push({
      id: 'summary',
      title: 'Summary Present',
      description: `Summary has ${summaryLength} words. Aim for 30-70 words for optimal ATS impact.`,
      status: 'tip',
      points: 10,
      maxPoints: 15,
    });
  } else {
    checks.push({
      id: 'summary',
      title: 'Missing Professional Summary',
      description: 'An executive summary provides key context and keyword density for ATS scoring.',
      status: 'warning',
      points: 0,
      maxPoints: 15,
    });
  }

  // Check 4: Work Experience & Chronology
  if (exp.length >= 2) {
    const hasDates = exp.every((e) => Boolean(e.duration && e.duration.trim()));
    const hasTitles = exp.every((e) => Boolean(e.jobTitle && e.company));
    if (hasDates && hasTitles) {
      checks.push({
        id: 'experience_structure',
        title: 'Structured Work Chronology',
        description: `${exp.length} career positions with clear titles, companies, and date durations.`,
        status: 'passed',
        points: 20,
        maxPoints: 20,
      });
    } else {
      checks.push({
        id: 'experience_structure',
        title: 'Experience Dates or Companies Incomplete',
        description: 'Ensure all roles specify clear employment durations and company names.',
        status: 'warning',
        points: 12,
        maxPoints: 20,
      });
    }
  } else if (exp.length === 1) {
    checks.push({
      id: 'experience_structure',
      title: 'Limited Work History',
      description: 'Single position detected. Add additional roles or project history if available.',
      status: 'warning',
      points: 10,
      maxPoints: 20,
    });
  } else {
    checks.push({
      id: 'experience_structure',
      title: 'No Work Experience Listed',
      description: 'Work experience section is critical for automated qualification scoring.',
      status: 'warning',
      points: 0,
      maxPoints: 20,
    });
  }

  // Check 5: Measurable Metric Impact & Action Verbs
  const allExpText = exp
    .map((e) => `${(e.highlights || []).join(' ')} ${(e.achievements || []).join(' ')}`)
    .join(' ')
    .toLowerCase();

  // Metrics matcher (% or $ or digits)
  const metricsMatches = allExpText.match(/(\d+[%kKmMbB]|\$\d+|\d+\+|\b\d{2,}\b)/g) || [];
  const detectedMetricsCount = metricsMatches.length;

  // Action verbs matcher
  let detectedActionVerbsCount = 0;
  ACTION_VERBS.forEach((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = allExpText.match(regex);
    if (matches) detectedActionVerbsCount += matches.length;
  });

  if (detectedMetricsCount >= 4 && detectedActionVerbsCount >= 6) {
    checks.push({
      id: 'metrics_action_verbs',
      title: 'Quantified Metrics & Power Verbs',
      description: `High impact: ${detectedMetricsCount} quantified metrics and ${detectedActionVerbsCount} strong action verbs detected.`,
      status: 'passed',
      points: 15,
      maxPoints: 15,
    });
  } else if (detectedMetricsCount >= 2 || detectedActionVerbsCount >= 3) {
    checks.push({
      id: 'metrics_action_verbs',
      title: 'Moderate Impact Metrics',
      description: `Detected ${detectedMetricsCount} metrics and ${detectedActionVerbsCount} action verbs. Adding more numbers ($/%) boosts ATS ranking.`,
      status: 'tip',
      points: 10,
      maxPoints: 15,
    });
  } else {
    checks.push({
      id: 'metrics_action_verbs',
      title: 'Few Quantifiable Metrics Detected',
      description: 'Add numbers, percentages (%), dollar amounts, or team sizes to pass ATS impact filters.',
      status: 'warning',
      points: 4,
      maxPoints: 15,
    });
  }

  // Check 6: Core Skills & Competencies
  if (skills.length >= 6) {
    checks.push({
      id: 'skills_keywords',
      title: 'Rich Skill Keyword Density',
      description: `${skills.length} core competencies and industry skills indexed for ATS matching.`,
      status: 'passed',
      points: 10,
      maxPoints: 10,
    });
  } else if (skills.length >= 3) {
    checks.push({
      id: 'skills_keywords',
      title: 'Basic Skills Count',
      description: `${skills.length} skills listed. Aim for 8-12 relevant skills to match more job requirements.`,
      status: 'tip',
      points: 6,
      maxPoints: 10,
    });
  } else {
    checks.push({
      id: 'skills_keywords',
      title: 'Low Skill Count',
      description: 'Applicant Tracking Systems match applicants heavily based on listed skills.',
      status: 'warning',
      points: 2,
      maxPoints: 10,
    });
  }

  // Check 7: Education & Credentials
  if (edu.length >= 1 && edu[0].school && edu[0].degree) {
    checks.push({
      id: 'education',
      title: 'Recognized Education Credentials',
      description: `Standard academic credentials (${edu[0].degree}) parsed properly.`,
      status: 'passed',
      points: 10,
      maxPoints: 10,
    });
  } else {
    checks.push({
      id: 'education',
      title: 'Education Incomplete',
      description: 'Degree name and school institution should be clearly defined.',
      status: 'warning',
      points: 3,
      maxPoints: 10,
    });
  }

  // Total Score Calculation
  const totalEarned = checks.reduce((acc, c) => acc + c.points, 0);
  const maxPossible = checks.reduce((acc, c) => acc + c.maxPoints, 0);
  const finalScore = Math.min(100, Math.round((totalEarned / maxPossible) * 100));

  let grade: AtsAnalysis['grade'] = 'Needs Improvement';
  if (finalScore >= 95) grade = 'A+';
  else if (finalScore >= 88) grade = 'A';
  else if (finalScore >= 80) grade = 'B+';
  else if (finalScore >= 70) grade = 'B';

  // Smart Recommendations
  const recommendations: string[] = [];
  if (detectedMetricsCount < 4) {
    recommendations.push(
      'Quantify results: Add % revenue growth, budget managed, or headcount supervised in work experience bullet points.'
    );
  }
  if (skills.length < 8) {
    recommendations.push(
      'Expand skills list: Add domain-specific keywords, tools, certifications, and frameworks.'
    );
  }
  if (!p.availability || !p.availability.trim()) {
    recommendations.push(
      'Indicate availability status (e.g., "Available Immediately" or "30 Days Notice") to satisfy recruiter screening filters.'
    );
  }
  if (!p.linkedin || !p.linkedin.trim()) {
    recommendations.push('Include a LinkedIn profile URL for automated candidate verification.');
  }

  const allWords = [
    p.fullName,
    p.headline,
    data.summary,
    ...exp.flatMap((e) => [e.jobTitle, e.company, ...(e.highlights || []), ...(e.achievements || [])]),
    ...skills.map((s) => s.name),
    ...edu.flatMap((e) => [e.school, e.degree]),
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean);

  return {
    score: finalScore,
    grade,
    checks,
    detectedMetricsCount,
    detectedActionVerbsCount,
    skillsCount: skills.length,
    wordCount: allWords.length,
    recommendations,
  };
}
