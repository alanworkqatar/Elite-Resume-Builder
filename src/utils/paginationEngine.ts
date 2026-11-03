import { ResumeData, TemplateStyle, WorkExperience, Education, AwardItem } from '../types/resume';

export interface PageDistribution {
  totalPages: number;
  page1: {
    experiences: WorkExperience[];
    hasEducation: boolean;
    hasAwards: boolean;
    fullnessPercentage: number;
    usedHeightPx: number;
    maxHeightPx: number;
  };
  page2: {
    experiences: WorkExperience[];
    hasEducation: boolean;
    hasAwards: boolean;
    fullnessPercentage: number;
    usedHeightPx: number;
    maxHeightPx: number;
  };
}

/**
 * Accurately estimates rendered vertical height in pixels for resume content blocks
 * calibrated to real DOM rendering at 10.5pt font (line-height ~15px, tight margins).
 */
export function estimateBlockHeight(
  type: string,
  data: any,
  density: 'comfortable' | 'compact' = 'comfortable'
): number {
  const isCompact = density === 'compact';

  switch (type) {
    case 'header': {
      // In executive two-column, right column only has Name & Headline
      const hasHeadline = Boolean(data?.headline);
      return hasHeadline ? (isCompact ? 48 : 56) : (isCompact ? 34 : 40);
    }
    case 'single_col_header': {
      // Single-column ATS header with candidate photo preset, name, headline, contact bar
      const hasHeadline = Boolean(data?.headline);
      return hasHeadline ? (isCompact ? 80 : 92) : (isCompact ? 65 : 74);
    }
    case 'summary': {
      const text = (data || '').trim();
      if (!text) return 0;
      // In 67% width of A4 (530px), 1 line holds ~95 chars at 10.5pt
      const lines = Math.max(1, Math.ceil(text.length / 95));
      const headingHeight = isCompact ? 18 : 22;
      const lineHeight = isCompact ? 14 : 16;
      const margin = isCompact ? 8 : 12;
      return headingHeight + lines * lineHeight + margin;
    }
    case 'skills_section': {
      const skills = (data || []) as any[];
      if (!skills.length) return 0;
      const headingHeight = isCompact ? 18 : 22;
      const rows = Math.ceil(skills.length / 3);
      return headingHeight + rows * (isCompact ? 16 : 19) + (isCompact ? 6 : 10);
    }
    case 'experience_item': {
      const exp = data as WorkExperience;
      if (!exp) return 0;
      // Title, company, duration line
      let height = isCompact ? 28 : 34;

      // Highlights bullets (approx 80-90 chars per line in 10.5pt)
      const highlights = (exp.highlights || []).filter(Boolean);
      for (const h of highlights) {
        const bulletLines = Math.max(1, Math.ceil(h.length / 85));
        height += bulletLines * (isCompact ? 14 : 16) + (isCompact ? 2 : 3);
      }

      // Achievements bullets
      const achievements = (exp.achievements || []).filter(Boolean);
      if (achievements.length > 0) {
        height += isCompact ? 14 : 18; // "Key Achievements:" title
        for (const a of achievements) {
          const achLines = Math.max(1, Math.ceil(a.length / 85));
          height += achLines * (isCompact ? 14 : 16) + (isCompact ? 2 : 3);
        }
      }

      // Spacing between jobs
      height += isCompact ? 8 : 12;
      return height;
    }
    case 'education_section': {
      const eduList = (data || []) as Education[];
      if (!eduList.length) return 0;
      const headingHeight = isCompact ? 20 : 24;
      const itemHeight = isCompact ? 24 : 28;
      return headingHeight + eduList.length * itemHeight + (isCompact ? 6 : 10);
    }
    case 'awards_section': {
      const awardList = (data || []) as AwardItem[];
      if (!awardList.length) return 0;
      const headingHeight = isCompact ? 20 : 24;
      const itemHeight = isCompact ? 16 : 20;
      return headingHeight + awardList.length * itemHeight + (isCompact ? 6 : 10);
    }
    default:
      return 0;
  }
}

/**
 * Computes exact content distribution between Page 1 and Page 2.
 * Content stays on Page 1 until Page 1 reaches true 100% capacity (end of page).
 * Only when Page 1 is genuinely complete does subsequent content flow over to Page 2.
 */
export function computePageDistribution(
  data: ResumeData,
  templateStyle: TemplateStyle,
  density: 'comfortable' | 'compact' = 'comfortable',
  manualSplitIndex?: number | null
): PageDistribution {
  const isTwoCol = templateStyle === 'executive-two-column';
  const isCompact = density === 'compact';

  // Total printable height inside A4 sheet (1122.5px total height):
  // Subtracting container padding (24-28px top, 24-28px bottom) and page footer (30px):
  // Usable height allows filling all the way to page end (~1040px in comfortable, ~1070px in compact).
  const PAGE_1_MAX_HEIGHT = isCompact ? 1070 : 1040;
  const PAGE_2_MAX_HEIGHT = isCompact ? 1070 : 1040;

  let page1Used = 0;

  // 1. Header Height
  const headerHeight = estimateBlockHeight(
    isTwoCol ? 'header' : 'single_col_header',
    data.personal,
    density
  );
  page1Used += headerHeight;

  // 2. Summary Height
  if (data.summary) {
    const summaryHeight = estimateBlockHeight('summary', data.summary, density);
    page1Used += summaryHeight;
  }

  // 3. In single-column ATS templates, Skills appear on Page 1
  if (!isTwoCol && data.skills && data.skills.length > 0) {
    const skillsHeight = estimateBlockHeight('skills_section', data.skills, density);
    page1Used += skillsHeight;
  }

  // 4. Section Title for Experience
  const expHeadingHeight = isCompact ? 20 : 24;
  page1Used += expHeadingHeight;

  const allExperiences = data.experience || [];
  const page1Experiences: WorkExperience[] = [];
  const page2Experiences: WorkExperience[] = [];

  const eduHeight = estimateBlockHeight('education_section', data.education, density);

  // For two-column executive format:
  // Calculate sidebar fullness on Page 1 to ensure skills and awards never get clipped.
  let sidebarUsed = 0;
  if (isTwoCol) {
    // 1. Candidate photo + container
    sidebarUsed += isCompact ? 95 : 110;
    // 2. Contact details
    const hasContact = Boolean(
      data.personal.location ||
      data.personal.email ||
      data.personal.phone ||
      data.personal.passportNo ||
      data.personal.nationality
    );
    if (hasContact) {
      let contactLines = 0;
      if (data.personal.location) contactLines++;
      if (data.personal.email) contactLines++;
      if (data.personal.phone) contactLines++;
      if (data.personal.passportNo) contactLines++;
      if (data.personal.nationality) contactLines++;
      sidebarUsed += (isCompact ? 20 : 24) + contactLines * (isCompact ? 16 : 20);
    }
    // 3. Skills summary
    const skillsCount = (data.skills || []).length;
    if (skillsCount > 0) {
      sidebarUsed += (isCompact ? 20 : 24) + skillsCount * (isCompact ? 18 : 22);
    }
    // 4. Availability badge
    if (data.personal.availability) {
      sidebarUsed += isCompact ? 36 : 44;
    }
    sidebarUsed += isCompact ? 40 : 55; // vertical paddings and spacing
  }

  const rawAwardsHeight = estimateBlockHeight('awards_section', data.awards, density);
  const awardsCount = (data.awards || []).length;
  // Printable sidebar limit inside A4 before clipping occurs (~820px)
  const SIDEBAR_MAX_PAGE1 = isCompact ? 860 : 820;
  const sidebarFitsAwards = isTwoCol && sidebarUsed + rawAwardsHeight <= SIDEBAR_MAX_PAGE1;

  if (typeof manualSplitIndex === 'number' && manualSplitIndex >= 0) {
    for (let i = 0; i < allExperiences.length; i++) {
      if (i < manualSplitIndex) {
        page1Experiences.push(allExperiences[i]);
      } else {
        page2Experiences.push(allExperiences[i]);
      }
    }
  } else {
    // Dynamic page-complete allocation:
    // Place experiences on Page 1 until adding the next one would genuinely exceed the end of Page 1.
    for (let i = 0; i < allExperiences.length; i++) {
      const exp = allExperiences[i];
      const expHeight = estimateBlockHeight('experience_item', exp, density);

      // Always allow at least the 1st experience on Page 1
      if (page1Experiences.length === 0 || page1Used + expHeight <= PAGE_1_MAX_HEIGHT) {
        page1Experiences.push(exp);
        page1Used += expHeight;
      } else {
        // Page 1 is complete to the very end! Remaining items flow to Page 2
        page2Experiences.push(exp);
      }
    }
  }

  // Can Education fit on Page 1 before the page end?
  let eduOnPage1 = false;
  if (data.education && data.education.length > 0) {
    if (page2Experiences.length === 0 && page1Used + eduHeight <= PAGE_1_MAX_HEIGHT) {
      eduOnPage1 = true;
      page1Used += eduHeight;
    } else {
      eduOnPage1 = false;
    }
  }

  // Can Awards / Certificates fit on Page 1 before the page end?
  let awardsOnPage1 = false;
  if (awardsCount > 0) {
    if (isTwoCol) {
      // In two-column:
      // If the resume requires Page 2 (from experiences/education) OR if sidebar doesn't comfortably fit awards,
      // awards are placed on Page 2 sidebar where there is ample room and zero clipping risk!
      if (page2Experiences.length === 0 && eduOnPage1 && sidebarFitsAwards) {
        awardsOnPage1 = true;
      } else {
        awardsOnPage1 = false;
      }
    } else {
      // In single-column ATS:
      if (page2Experiences.length === 0 && eduOnPage1 && page1Used + rawAwardsHeight <= PAGE_1_MAX_HEIGHT) {
        awardsOnPage1 = true;
        page1Used += rawAwardsHeight;
      } else {
        awardsOnPage1 = false;
      }
    }
  }

  // Page 2 calculation
  let page2Used = 0;
  const hasPage2Awards = !awardsOnPage1 && awardsCount > 0;
  const hasPage2Education = !eduOnPage1 && (data.education || []).length > 0;

  if (page2Experiences.length > 0 || hasPage2Education || hasPage2Awards) {
    page2Used += isCompact ? 40 : 48;

    for (const exp of page2Experiences) {
      page2Used += estimateBlockHeight('experience_item', exp, density);
    }

    if (hasPage2Education) {
      page2Used += eduHeight;
    }

    if (hasPage2Awards) {
      page2Used += rawAwardsHeight;
    }
  }

  const isMultiPage =
    page2Experiences.length > 0 ||
    hasPage2Education ||
    hasPage2Awards;

  const totalPages = isMultiPage ? 2 : 1;

  const page1Percent = Math.min(100, Math.round((page1Used / PAGE_1_MAX_HEIGHT) * 100));
  const page2Percent = isMultiPage
    ? Math.min(100, Math.round((page2Used / PAGE_2_MAX_HEIGHT) * 100))
    : 0;

  return {
    totalPages,
    page1: {
      experiences: page1Experiences,
      hasEducation: eduOnPage1,
      hasAwards: awardsOnPage1,
      fullnessPercentage: page1Percent,
      usedHeightPx: page1Used,
      maxHeightPx: PAGE_1_MAX_HEIGHT,
    },
    page2: {
      experiences: page2Experiences,
      hasEducation: hasPage2Education,
      hasAwards: hasPage2Awards,
      fullnessPercentage: page2Percent,
      usedHeightPx: page2Used,
      maxHeightPx: PAGE_2_MAX_HEIGHT,
    },
  };
}
