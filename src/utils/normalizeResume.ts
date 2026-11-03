import { ResumeData, WorkExperience, Education, SkillItem, AwardItem } from '../types/resume';
import { sortExperiencesChronologically } from './dateSorter';

/**
 * Normalizes any partial or incomplete resume object into a fully defined ResumeData structure.
 * Guarantees every single field is non-undefined to strictly prevent React controlled-to-uncontrolled input warnings.
 * Robustly maps various naming conventions (e.g. role/position -> jobTitle, companyName/employer -> company,
 * responsibilities/bullets -> highlights, dates/period -> duration) from LLMs, JSON Resume, LinkedIn, and uploaded files.
 * Automatically sorts work experiences in reverse chronological order (most recent first).
 */
export function normalizeResumeData(data?: any, autoSort = true): ResumeData {
  const p = data?.personal || data?.contact || data?.basics || {};

  // Extract raw experiences from any possible key name
  const rawExpArray =
    data?.experience ??
    data?.workExperience ??
    data?.work_experience ??
    data?.experiences ??
    data?.work ??
    data?.jobs ??
    data?.employment ??
    data?.positions ??
    data?.history ??
    [];

  const rawExperiences: WorkExperience[] = Array.isArray(rawExpArray)
    ? rawExpArray
        .map((exp: any, idx: number) => {
          if (!exp || typeof exp !== 'object') return null;

          // Job Title: support jobTitle, title, role, position, designation, job_title, headline
          let jobTitle = (
            exp?.jobTitle ??
            exp?.title ??
            exp?.role ??
            exp?.position ??
            exp?.designation ??
            exp?.job_title ??
            exp?.headline ??
            ''
          ).toString().trim();

          // Company: support company, companyName, employer, organization, workplace, name
          let company = (
            exp?.company ??
            exp?.companyName ??
            exp?.company_name ??
            exp?.employer ??
            exp?.organization ??
            exp?.workplace ??
            exp?.name ??
            ''
          ).toString().trim();

          // Location: support location, city, country, address
          let location = (
            exp?.location ??
            exp?.city ??
            exp?.country ??
            exp?.address ??
            ''
          ).toString().trim();

          // Duration: support duration, dates, period, timePeriod, years, timeframe, startDate + endDate
          let duration = (
            exp?.duration ??
            exp?.dates ??
            exp?.period ??
            exp?.timePeriod ??
            exp?.years ??
            exp?.timeframe ??
            (exp?.startDate && exp?.endDate
              ? `${exp.startDate} - ${exp.endDate}`
              : exp?.startDate ?? '')
          ).toString().trim();

          // If title contains pipe or dash with company, e.g. "IT Manager | BCCL"
          if (jobTitle && !company && /[-–—|@]/.test(jobTitle)) {
            const split = jobTitle.split(/[-–—|@]/).map((s: string) => s.trim()).filter(Boolean);
            if (split.length >= 2) {
              jobTitle = split[0];
              company = split[1];
              if (split[2] && !location) location = split[2];
            }
          }

          // Highlights / Responsibilities / Bullets
          let highlights: string[] = [];
          const rawHighlights =
            exp?.highlights ??
            exp?.responsibilities ??
            exp?.bullets ??
            exp?.duties ??
            exp?.tasks ??
            exp?.description ??
            exp?.details ??
            exp?.points;

          if (Array.isArray(rawHighlights)) {
            highlights = rawHighlights
              .map((h: any) => (h ?? '').toString().replace(/^[•\-*–—▪▫➢\s]+/, '').trim())
              .filter((h: string) => h.length > 0);
          } else if (typeof rawHighlights === 'string' && rawHighlights.trim()) {
            highlights = rawHighlights
              .split(/\r?\n|•|;\s/)
              .map((h: string) => h.replace(/^[•\-*–—▪▫➢\s]+/, '').trim())
              .filter((h: string) => h.length > 0);
          }

          // Achievements / Accomplishments / Key Achievements
          let achievements: string[] = [];
          const rawAchievements =
            exp?.achievements ??
            exp?.accomplishments ??
            exp?.keyAchievements ??
            exp?.key_achievements ??
            exp?.results;

          if (Array.isArray(rawAchievements)) {
            achievements = rawAchievements
              .map((a: any) => (a ?? '').toString().replace(/^[•\-*–—▪▫➢\s]+/, '').trim())
              .filter((a: string) => a.length > 0);
          } else if (typeof rawAchievements === 'string' && rawAchievements.trim()) {
            achievements = rawAchievements
              .split(/\r?\n|•|;\s/)
              .map((a: string) => a.replace(/^[•\-*–—▪▫➢\s]+/, '').trim())
              .filter((a: string) => a.length > 0);
          }

          // If highlights is empty but achievements has items, populate highlights
          if (highlights.length === 0 && achievements.length > 0) {
            highlights = [...achievements];
          }

          // Filter out completely blank ghost entries
          if (!jobTitle && !company && !duration && highlights.length === 0 && achievements.length === 0) {
            return null;
          }

          return {
            id: (exp?.id ?? `exp-${Date.now()}-${idx}`).toString(),
            jobTitle: jobTitle || 'Professional Role',
            company: company || 'Organization',
            location,
            duration: duration || 'Past Experience',
            highlights,
            achievements,
          } as WorkExperience;
        })
        .filter(Boolean) as WorkExperience[]
    : [];

  const finalExperiences = autoSort
    ? sortExperiencesChronologically(rawExperiences, 'reverse')
    : rawExperiences;

  // Education array normalization
  const rawEduArray =
    data?.education ??
    data?.educations ??
    data?.academic ??
    data?.qualifications ??
    [];

  const finalEducation: Education[] = Array.isArray(rawEduArray)
    ? rawEduArray
        .map((edu: any, idx: number) => {
          if (!edu || typeof edu !== 'object') return null;
          const school = (edu?.school ?? edu?.institution ?? edu?.university ?? edu?.college ?? '').toString().trim();
          const degree = (edu?.degree ?? edu?.qualification ?? edu?.major ?? edu?.course ?? '').toString().trim();
          const duration = (edu?.duration ?? edu?.dates ?? edu?.years ?? edu?.period ?? (edu?.startDate && edu?.endDate ? `${edu.startDate} - ${edu.endDate}` : edu?.startDate ?? '')).toString().trim();
          const location = (edu?.location ?? edu?.city ?? '').toString().trim();
          const details = (edu?.details ?? edu?.gpa ?? edu?.description ?? '').toString().trim();

          if (!school && !degree && !duration) return null;

          return {
            id: (edu?.id ?? `edu-${Date.now()}-${idx}`).toString(),
            school: school || 'Institution',
            degree: degree || 'Degree / Qualification',
            duration: duration || 'Graduated',
            location,
            details,
          };
        })
        .filter(Boolean) as Education[]
    : [];

  // Skills array normalization
  const rawSkillsArray =
    data?.skills ??
    data?.coreSkills ??
    data?.technicalSkills ??
    data?.competencies ??
    [];

  const finalSkills: SkillItem[] = Array.isArray(rawSkillsArray)
    ? rawSkillsArray
        .map((skill: any, idx: number) => {
          if (!skill) return null;
          const name = (typeof skill === 'string' ? skill : skill?.name ?? skill?.skill ?? '').toString().trim();
          if (!name) return null;
          const rating =
            typeof skill?.rating === 'number' && !isNaN(skill.rating)
              ? Math.min(5, Math.max(1, skill.rating))
              : 4;
          return {
            id: (skill?.id ?? `sk-${Date.now()}-${idx}`).toString(),
            name,
            rating,
          };
        })
        .filter(Boolean) as SkillItem[]
    : [];

  // Awards array normalization
  const rawAwardsArray =
    data?.awards ??
    data?.certifications ??
    data?.honors ??
    data?.certificates ??
    [];

  const finalAwards: AwardItem[] = Array.isArray(rawAwardsArray)
    ? rawAwardsArray
        .map((award: any, idx: number) => {
          if (!award) return null;
          const title = (typeof award === 'string' ? award : award?.title ?? award?.name ?? '').toString().trim();
          if (!title) return null;
          const years = (award?.years ?? award?.year ?? award?.date ?? '').toString().trim();
          const organization = (award?.organization ?? award?.issuer ?? '').toString().trim();

          return {
            id: (award?.id ?? `aw-${Date.now()}-${idx}`).toString(),
            title,
            years,
            organization,
          };
        })
        .filter(Boolean) as AwardItem[]
    : [];

  return {
    personal: {
      fullName: (p.fullName ?? p.name ?? '').toString().trim(),
      headline: (p.headline ?? p.title ?? p.label ?? '').toString().trim(),
      photoUrl: (p.photoUrl ?? p.image ?? p.picture ?? '').toString().trim(),
      photoShape: p.photoShape === 'circle' || p.photoShape === 'rounded' ? p.photoShape : 'square',
      photoFit: p.photoFit === 'contain' ? 'contain' : 'cover',
      photoPosition: p.photoPosition === 'center' ? 'center' : 'top',
      photoAlignment: p.photoAlignment === 'center' || p.photoAlignment === 'right' ? p.photoAlignment : 'left',
      email: (p.email ?? '').toString().trim(),
      phone: (p.phone ?? p.phoneNumber ?? '').toString().trim(),
      location: (p.location ?? (p.city && p.country ? `${p.city}, ${p.country}` : p.city ?? p.country ?? '')).toString().trim(),
      passportNo: (p.passportNo ?? p.passport ?? '').toString().trim(),
      nationality: (p.nationality ?? '').toString().trim(),
      visaStatus: (p.visaStatus ?? p.visa ?? '').toString().trim(),
      availability: (p.availability ?? 'CAN JOIN IMMEDIATELY').toString().trim(),
      linkedin: (p.linkedin ?? p.profiles?.find((pr: any) => /linkedin/i.test(pr.network || pr.url))?.url ?? '').toString().trim(),
      website: (p.website ?? p.url ?? '').toString().trim(),
    },
    summary: (data?.summary ?? data?.objective ?? data?.about ?? data?.profile ?? '').toString().trim(),
    experience: finalExperiences,
    education: finalEducation,
    skills: finalSkills,
    awards: finalAwards,
  };
}

