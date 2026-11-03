import { WorkExperience, Education } from '../types/resume';

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

export interface ParsedDateRange {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  isPresent: boolean;
  startScore: number;
  endScore: number;
}

/**
 * Parses any date or duration string (e.g. "Aug 2010 - Jun 2018", "2019 - Present", "04/2008 - 08/2010")
 * into normalized numerical start and end scores for precise chronological comparison.
 */
export function parseDateRange(durationStr?: string): ParsedDateRange {
  const fallback: ParsedDateRange = {
    startYear: 1970,
    startMonth: 1,
    endYear: 1970,
    endMonth: 1,
    isPresent: false,
    startScore: 1970 * 12 + 1,
    endScore: 1970 * 12 + 1,
  };

  if (!durationStr || typeof durationStr !== 'string') {
    return fallback;
  }

  const clean = durationStr.trim();
  if (!clean) return fallback;

  const isPresent = /(?:present|current|now|till\s*date|ongoing|continue)/i.test(clean);

  // Split start and end segments by common range delimiters
  const segments = clean.split(/[-–—to~]+/).map((s) => s.trim()).filter(Boolean);

  const parseSingleDate = (segment?: string): { year: number; month: number } => {
    if (!segment) return { year: 1970, month: 1 };

    // Check for "Present" / "Current"
    if (/(?:present|current|now|till\s*date|ongoing)/i.test(segment)) {
      const now = new Date();
      return { year: now.getFullYear() + 10, month: 12 };
    }

    // Match 4-digit year (19xx or 20xx)
    const yearMatch = segment.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 1970;

    // Match month name
    let month = 1;
    const wordMatches = segment.toLowerCase().match(/[a-z]{3,9}/g);
    if (wordMatches) {
      for (const w of wordMatches) {
        if (MONTH_MAP[w]) {
          month = MONTH_MAP[w];
          break;
        }
      }
    } else {
      // Check for numeric month e.g. "08/2010" or "2010-08"
      const slashMatch = segment.match(/\b(0?[1-9]|1[0-2])[\/\-.](?:19\d{2}|20\d{2})\b/);
      if (slashMatch) {
        month = parseInt(slashMatch[1], 10);
      }
    }

    return { year, month };
  };

  let startYear = 1970;
  let startMonth = 1;
  let endYear = 1970;
  let endMonth = 1;

  if (segments.length === 1) {
    const single = parseSingleDate(segments[0]);
    startYear = single.year;
    startMonth = single.month;
    endYear = isPresent ? 9999 : single.year;
    endMonth = isPresent ? 12 : single.month;
  } else if (segments.length >= 2) {
    const start = parseSingleDate(segments[0]);
    startYear = start.year;
    startMonth = start.month;

    if (isPresent) {
      endYear = 9999;
      endMonth = 12;
    } else {
      const end = parseSingleDate(segments[1]);
      endYear = end.year;
      endMonth = end.month;
    }
  }

  const startScore = startYear * 12 + startMonth;
  const endScore = isPresent ? 9999 * 12 + 12 : endYear * 12 + endMonth;

  return {
    startYear,
    startMonth,
    endYear,
    endMonth,
    isPresent,
    startScore,
    endScore,
  };
}

/**
 * Sorts an array of WorkExperience entries chronologically.
 * @param experiences Array of work experiences
 * @param order 'reverse' (default, most recent job first) or 'forward' (oldest job first)
 */
export function sortExperiencesChronologically(
  experiences: WorkExperience[],
  order: 'reverse' | 'forward' = 'reverse'
): WorkExperience[] {
  if (!Array.isArray(experiences) || experiences.length <= 1) {
    return experiences || [];
  }

  return [...experiences].sort((a, b) => {
    const dateA = parseDateRange(a.duration);
    const dateB = parseDateRange(b.duration);

    if (order === 'reverse') {
      // 1. Primary sort: End Date descending (most recent completion first)
      if (dateB.endScore !== dateA.endScore) {
        return dateB.endScore - dateA.endScore;
      }
      // 2. Secondary sort: Start Date descending (most recent start first)
      if (dateB.startScore !== dateA.startScore) {
        return dateB.startScore - dateA.startScore;
      }
      return 0;
    } else {
      // Forward chronological (oldest start date first)
      if (dateA.startScore !== dateB.startScore) {
        return dateA.startScore - dateB.startScore;
      }
      if (dateA.endScore !== dateB.endScore) {
        return dateA.endScore - dateB.endScore;
      }
      return 0;
    }
  });
}

/**
 * Sorts education qualifications chronologically (most recent graduation first).
 */
export function sortEducationChronologically(
  educationList: Education[],
  order: 'reverse' | 'forward' = 'reverse'
): Education[] {
  if (!Array.isArray(educationList) || educationList.length <= 1) {
    return educationList || [];
  }

  return [...educationList].sort((a, b) => {
    const dateA = parseDateRange(a.duration);
    const dateB = parseDateRange(b.duration);

    if (order === 'reverse') {
      if (dateB.endScore !== dateA.endScore) return dateB.endScore - dateA.endScore;
      return dateB.startScore - dateA.startScore;
    } else {
      if (dateA.startScore !== dateB.startScore) return dateA.startScore - dateB.startScore;
      return dateA.endScore - dateB.endScore;
    }
  });
}
