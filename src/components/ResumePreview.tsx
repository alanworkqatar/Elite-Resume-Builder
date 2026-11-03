import React, { useRef, useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Bookmark,
  Award,
  Globe,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileType,
  Layers,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Cpu,
  Crown,
  FileCheck2,
  Briefcase,
  User,
  Upload
} from 'lucide-react';
import { ResumeData, TemplateStyle, WorkExperience } from '../types/resume';
import { RESUME_TEMPLATES } from '../data/templates';
import { analyzeResumeForAts } from '../utils/atsAnalyzer';
import { computePageDistribution } from '../utils/paginationEngine';

interface ResumePreviewProps {
  data: ResumeData;
  templateStyle: TemplateStyle;
  onSelectTemplate?: (template: TemplateStyle) => void;
  onOpenTemplateSelector?: () => void;
  onOpenAtsOptimizer?: () => void;
  onDownloadPdf: () => void;
  onDownloadDoc?: (format?: 'doc' | 'docx') => void;
  onPrintVector: () => void;
  isDownloadingPdf?: boolean;
  onChangePhotoAlignment?: (alignment: 'left' | 'center' | 'right') => void;
  onOpenUploadModal?: () => void;
  onLoadSample?: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  templateStyle,
  onSelectTemplate,
  onOpenTemplateSelector,
  onOpenAtsOptimizer,
  onDownloadPdf,
  onDownloadDoc,
  onPrintVector,
  isDownloadingPdf = false,
  onChangePhotoAlignment,
  onOpenUploadModal,
  onLoadSample,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [manualSplitIndex, setManualSplitIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isResumeEmpty =
    !data.personal?.fullName?.trim() &&
    (!data.experience || data.experience.length === 0) &&
    !data.summary?.trim();

  const photoAlignment = data.personal.photoAlignment || 'left';

  const renderDisplayName = (name?: string) => {
    if (name && name.trim()) return name;
    return <span className="text-slate-400 font-normal italic tracking-normal">[Candidate Name]</span>;
  };

  // Dynamic Page-Complete Pagination Engine
  // Allows typing until the first page is genuinely complete before paginating to Page 2
  const pagination = computePageDistribution(data, templateStyle, density, manualSplitIndex);
  const totalPages = pagination.totalPages;
  const isMultiPage = totalPages > 1;

  const page1Experiences = pagination.page1.experiences;
  const page2Experiences = pagination.page2.experiences;
  const page1HasEducation = pagination.page1.hasEducation;
  const page2HasEducation = pagination.page2.hasEducation;
  const page1HasAwards = pagination.page1.hasAwards;
  const page2HasAwards = pagination.page2.hasAwards;

  const currentTemplate =
    RESUME_TEMPLATES.find((t) => t.id === templateStyle) || RESUME_TEMPLATES[0];

  const atsAnalysis = analyzeResumeForAts(data);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(1.4, Math.max(0.6, parseFloat((prev + delta).toFixed(1)))));
  };

  const handleFitPage = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      const scale = Math.min(1, Math.max(0.6, containerWidth / 820));
      setZoom(parseFloat(scale.toFixed(2)));
    }
  };

  React.useEffect(() => {
    handleFitPage();
    const handleResize = () => handleFitPage();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderSkillDots = (rating: number) => {
    const totalDots = 5;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: totalDots }).map((_, i) => (
          <span
            key={i}
            className={`inline-block rounded-full transition-all ${
              i < rating
                ? 'w-2 h-2 bg-cyan-300'
                : 'w-2 h-2 bg-slate-600/70 border border-slate-500/50'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderCandidatePhoto = (
    sizeClass = 'w-26 h-26',
    borderClass = 'border-[3px] border-white shadow-xl'
  ) => (
    <div className="flex flex-col items-center shrink-0">
      <div
        className={`${sizeClass} aspect-square ${
          data.personal.photoShape === 'circle'
            ? 'rounded-full'
            : data.personal.photoShape === 'rounded'
            ? 'rounded-2xl'
            : 'rounded-lg'
        } ${borderClass} overflow-hidden bg-slate-800 flex items-center justify-center relative`}
      >
        {data.personal.photoUrl ? (
          <img
            src={data.personal.photoUrl}
            alt={data.personal.fullName || 'Candidate Photo'}
            referrerPolicy="no-referrer"
            className={`w-full h-full aspect-square ${
              data.personal.photoFit === 'contain'
                ? 'object-contain bg-slate-950 p-1'
                : 'object-cover'
            } ${
              data.personal.photoPosition === 'center'
                ? 'object-center'
                : 'object-top'
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
            <span className="text-xl font-extrabold tracking-tight text-white uppercase">
              {(data.personal.fullName || 'CV')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span className="text-[8px] text-cyan-300 font-semibold tracking-wider uppercase mt-0.5">
              Photo
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderAvailabilityBadge = () =>
    data.personal.availability ? (
      <div className="pt-2">
        <div className="bg-sky-500/20 border border-sky-400/50 rounded-lg px-3 py-1.5 text-center shadow-md">
          <p className="text-[10px] font-bold text-sky-200 tracking-wider uppercase flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span>{data.personal.availability}</span>
          </p>
        </div>
      </div>
    ) : null;

  // ----------------------------------------------------
  // TEMPLATE 1: Executive Two-Column (Navy & White)
  // ----------------------------------------------------
  const renderExecutiveTwoColumn = () => {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* PAGE 1 */}
        <div className="w-[210mm] shrink-0">
          <div
            className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 flex shadow-2xl relative overflow-hidden"
            style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
          >
            {/* Sidebar (33% Navy #1E3A5F) */}
            <div
              className={`w-[33%] ${
                density === 'compact' ? 'p-5 sm:p-6' : 'p-6 sm:p-7'
              } text-white flex flex-col justify-between shrink-0 h-full overflow-hidden`}
              style={{ backgroundColor: '#1E3A5F' }}
            >
              <div className={density === 'compact' ? 'space-y-3.5' : 'space-y-4'}>
                <div
                  className={`flex flex-col ${
                    photoAlignment === 'center'
                      ? 'items-center'
                      : photoAlignment === 'right'
                      ? 'items-end'
                      : 'items-start'
                  } w-full`}
                >
                  {renderCandidatePhoto(
                    page1HasAwards ? 'w-22 h-22 sm:w-24 sm:h-24' : 'w-26 h-26',
                    'border-[3px] border-white shadow-xl'
                  )}
                </div>

                {/* Contact Info */}
                {(data.personal.location ||
                  data.personal.email ||
                  data.personal.phone ||
                  data.personal.passportNo ||
                  data.personal.nationality) && (
                  <div className="pt-0.5">
                    <h3
                      className="text-[11px] font-bold tracking-[0.2em] text-cyan-300 uppercase mb-2 border-b border-cyan-400/20 pb-0.5 whitespace-nowrap"
                      style={{ color: '#7DD3FC' }}
                    >
                      C O N T A C T &nbsp; M E &nbsp; A T
                    </h3>
                    <div className="space-y-1.5 text-[10.5px] leading-tight">
                      {data.personal.location && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                          <span className="text-slate-100 font-medium">
                            {data.personal.location}
                          </span>
                        </div>
                      )}
                      {data.personal.email && (
                        <div className="flex items-start gap-1.5 break-all">
                          <Mail className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                          <span className="text-slate-100">{data.personal.email}</span>
                        </div>
                      )}
                      {data.personal.phone && (
                        <div className="flex items-start gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                          <span className="text-slate-100">{data.personal.phone}</span>
                        </div>
                      )}
                      {data.personal.passportNo && (
                        <div className="text-slate-300 text-[10px] pl-5">
                          <span className="text-slate-400">Passport: </span>
                          <span className="text-white font-mono">{data.personal.passportNo}</span>
                        </div>
                      )}
                      {data.personal.nationality && (
                        <div className="text-slate-300 text-[10px] pl-5">
                          <span className="text-slate-400">Nationality: </span>
                          <span className="text-white">{data.personal.nationality}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {data.skills && data.skills.length > 0 && (
                  <div className="pt-0.5">
                    <h3
                      className="text-[11px] font-bold tracking-[0.2em] text-cyan-300 uppercase mb-2 border-b border-cyan-400/20 pb-0.5"
                      style={{ color: '#7DD3FC' }}
                    >
                      S K I L L S &nbsp; S U M M A R Y
                    </h3>
                    <div className="space-y-1.5">
                      {data.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between text-[10.5px]"
                        >
                          <span className="text-slate-100 font-medium truncate pr-2">
                            {skill.name}
                          </span>
                          {renderSkillDots(skill.rating)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards / Certificates on Page 1 (only when fits comfortably on single page) */}
                {page1HasAwards && data.awards && data.awards.length > 0 && (
                  <div className="pt-0.5">
                    <h3
                      className="text-[11px] font-bold tracking-[0.16em] text-cyan-300 uppercase mb-2 border-b border-cyan-400/20 pb-0.5 whitespace-nowrap flex items-center gap-1.5"
                      style={{ color: '#7DD3FC' }}
                    >
                      <Award className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                      <span>A W A R D S &nbsp;/&nbsp; C E R T I F I C A T E S</span>
                    </h3>
                    <div className="space-y-1.5">
                      {data.awards.map((award) => (
                        <div key={award.id} className="text-[10px] leading-tight">
                          <div className="flex items-start gap-1 text-slate-100 font-medium">
                            <Bookmark className="w-3 h-3 text-cyan-300 shrink-0 mt-0.5" />
                            <span className="leading-tight">{award.title}</span>
                          </div>
                          {award.years && (
                            <span className="text-cyan-300/80 text-[9px] pl-4 block font-mono mt-0.5">
                              {award.years}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                {renderAvailabilityBadge()}
                <div className="mt-2 text-right">
                  <span className="text-[9px] text-cyan-300/70 font-mono">
                    Page 1 of {totalPages}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (67% Pure White) */}
            <div
              className={`w-[67%] ${
                density === 'compact' ? 'p-5 sm:p-6' : 'p-6 sm:p-7'
              } bg-white flex flex-col justify-between text-slate-800 h-full overflow-hidden`}
            >
              <div className={density === 'compact' ? 'space-y-3.5' : 'space-y-4'}>
                {/* Name & Headline */}
                <div className="border-b-2 border-slate-200 pb-2.5">
                  <h1
                    className="text-2xl sm:text-[26px] font-black tracking-tight uppercase leading-tight font-sans"
                    style={{ color: '#1E3A5F' }}
                  >
                    {renderDisplayName(data.personal.fullName)}
                  </h1>
                  {data.personal.headline && (
                    <p
                      className="text-xs sm:text-[13px] font-bold uppercase tracking-wider mt-0.5 font-sans"
                      style={{ color: '#64748B' }}
                    >
                      {data.personal.headline}
                    </p>
                  )}
                </div>

                {/* Summary */}
                {data.summary && (
                  <div>
                    <h2
                      className="text-xs font-bold tracking-[0.18em] uppercase mb-1.5 flex items-center gap-1.5"
                      style={{ color: '#0284C7' }}
                    >
                      <span className="w-2.5 h-0.5 bg-sky-600 inline-block" />
                      <span>P R O F I L E &nbsp; S U M M A R Y</span>
                    </h2>
                    <p className="text-[10.5px] leading-relaxed text-slate-700 font-sans text-left">
                      {data.summary}
                    </p>
                  </div>
                )}

                {/* Work Experience on Page 1 (Fills Page 1 until complete) */}
                {page1Experiences.length > 0 && (
                  <div>
                    <h2
                      className="text-xs font-bold tracking-[0.18em] uppercase mb-2 flex items-center gap-1.5"
                      style={{ color: '#0284C7' }}
                    >
                      <span className="w-2.5 h-0.5 bg-sky-600 inline-block" />
                      <span>W O R K &nbsp; E X P E R I E N C E</span>
                    </h2>
                    <div className="space-y-3">
                      {page1Experiences.map((exp) => (
                        <div key={exp.id} className="text-[10.5px] leading-snug">
                          <div className="flex justify-between items-baseline font-bold">
                            <span className="text-[12px]" style={{ color: '#1E3A5F' }}>
                              {exp.jobTitle}
                            </span>
                            <span className="text-[10px] text-slate-600 font-medium font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                              {exp.duration}
                            </span>
                          </div>
                          <div className="text-slate-600 italic text-[10.5px] mb-1">
                            {exp.company} {exp.location ? `• ${exp.location}` : ''}
                          </div>
                          {exp.highlights && exp.highlights.length > 0 && (
                            <ul className="list-disc pl-4 space-y-1 text-slate-700 mb-1.5 leading-relaxed text-[10.5px]">
                              {exp.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="mt-1 pl-2.5 border-l-2 border-sky-500 bg-sky-50/70 py-1.5 pr-2.5 rounded-r">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-sky-900 block mb-0.5 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-sky-600 shrink-0" />
                                <span>Key Metric Achievements:</span>
                              </span>
                              <ul className="list-disc pl-3.5 space-y-0.5 text-slate-700 leading-normal text-[10px]">
                                {exp.achievements.map((ach, i) => (
                                  <li key={i}>{ach}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education on Page 1 if page capacity allowed */}
                {page1HasEducation && data.education && data.education.length > 0 && (
                  <div>
                    <h2
                      className="text-xs font-bold tracking-[0.18em] uppercase mb-2 flex items-center gap-1.5"
                      style={{ color: '#0284C7' }}
                    >
                      <span className="w-2.5 h-0.5 bg-sky-600 inline-block" />
                      <span>E D U C A T I O N &nbsp; Q U A L I F I C A T I O N</span>
                    </h2>
                    <div className="space-y-2">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="text-[10.5px] leading-snug">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900 text-[11px]">{edu.school}</span>
                            <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                              {edu.duration}
                            </span>
                          </div>
                          <div className="text-slate-600 italic text-[10.5px]">{edu.degree}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Page 1 Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end text-[9.5px] text-slate-400 font-mono">
                <span>Page 1 of {totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2 (Rendered ONLY when Page 1 is complete and content overflows) */}
        {isMultiPage && (
          <div className="w-[210mm] shrink-0">
            <div
              className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 flex shadow-2xl relative overflow-hidden"
              style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
            >
              {/* Page 2 Sidebar (Identical 33% Navy #1E3A5F) */}
              <div
                className={`w-[33%] ${
                  density === 'compact' ? 'p-5 sm:p-6' : 'p-6 sm:p-7'
                } text-white flex flex-col justify-between shrink-0 h-full overflow-hidden`}
                style={{ backgroundColor: '#1E3A5F' }}
              >
                <div className={density === 'compact' ? 'space-y-4' : 'space-y-4.5'}>
                  {/* Monogram branding */}
                  <div className="flex items-center gap-3 pb-3 border-b border-cyan-400/20">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-200 font-black text-lg">
                      {(data.personal.fullName || 'CV')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        {data.personal.fullName || 'Candidate'}
                      </h4>
                      <p className="text-[10px] text-cyan-300 font-mono">Executive Profile</p>
                    </div>
                  </div>

                  {/* Quick Contact Bar */}
                  {(data.personal.email || data.personal.phone || data.personal.location) && (
                    <div>
                      <h3
                        className="text-[11px] font-bold tracking-[0.2em] text-cyan-300 uppercase mb-2 border-b border-cyan-400/20 pb-0.5"
                        style={{ color: '#7DD3FC' }}
                      >
                        D I R E C T &nbsp; C O N T A C T
                      </h3>
                      <div className="space-y-1.5 text-[10.5px] text-slate-200">
                        {data.personal.email && (
                          <div className="flex items-start gap-1.5 break-all">
                            <Mail className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                            <span className="truncate">{data.personal.email}</span>
                          </div>
                        )}
                        {data.personal.phone && (
                          <div className="flex items-start gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                            <span>{data.personal.phone}</span>
                          </div>
                        )}
                        {data.personal.location && (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                            <span>{data.personal.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Awards / Certificates & Honors on Page 2 (Spacious, prominent, zero clipping!) */}
                  {data.awards && data.awards.length > 0 && (
                    <div>
                      <h3
                        className="text-[11px] font-bold tracking-[0.18em] text-cyan-300 uppercase mb-2.5 border-b border-cyan-400/20 pb-1 flex items-center gap-1.5"
                        style={{ color: '#7DD3FC' }}
                      >
                        <Award className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                        <span>A W A R D S &nbsp;&amp;&nbsp; H O N O R S</span>
                      </h3>
                      <div className="space-y-2">
                        {data.awards.map((award) => (
                          <div
                            key={award.id}
                            className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[10.5px] leading-snug"
                          >
                            <div className="flex items-start gap-1.5 text-white font-semibold">
                              <Bookmark className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                              <span className="leading-tight">{award.title}</span>
                            </div>
                            {award.years && (
                              <div className="mt-1 pl-5">
                                <span className="text-cyan-300/80 text-[9.5px] font-mono bg-cyan-900/40 px-1.5 py-0.5 rounded border border-cyan-800/30">
                                  {award.years}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Competencies (if no awards, display candidate's real skills badges rather than dummy text) */}
                  {(!data.awards || data.awards.length === 0) && data.skills && data.skills.length > 0 && (
                    <div>
                      <h3
                        className="text-[11px] font-bold tracking-[0.2em] text-cyan-300 uppercase mb-2 border-b border-cyan-400/20 pb-0.5"
                        style={{ color: '#7DD3FC' }}
                      >
                        K E Y &nbsp; C O M P E T E N C I E S
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.map((s) => (
                          <span
                            key={s.id}
                            className="text-[9.5px] bg-cyan-950/60 border border-cyan-800/50 text-cyan-200 px-2 py-0.5 rounded-full"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {renderAvailabilityBadge()}
                  <div className="mt-2 text-right">
                    <span className="text-[9px] text-cyan-300/70 font-mono">
                      Page 2 of {totalPages}
                    </span>
                  </div>
                </div>
              </div>

              {/* Page 2 Right Column */}
              <div
                className={`w-[67%] ${
                  density === 'compact' ? 'p-5 sm:p-6' : 'p-6 sm:p-7'
                } bg-white flex flex-col justify-between text-slate-800 h-full overflow-hidden`}
              >
                <div className={density === 'compact' ? 'space-y-3.5' : 'space-y-4'}>
                  <div className="border-b border-slate-200 pb-2 flex justify-between items-end">
                    <div>
                      <h2
                        className="text-base sm:text-lg font-bold tracking-tight uppercase leading-tight"
                        style={{ color: '#1E3A5F' }}
                      >
                        {renderDisplayName(data.personal.fullName)}
                      </h2>
                      {data.personal.headline && (
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                          {data.personal.headline}
                        </p>
                      )}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono pb-0.5">
                      Page 2 of {totalPages}
                    </span>
                  </div>

                  {/* Overflow Work Experience */}
                  {page2Experiences.length > 0 && (
                    <div>
                      <h2
                        className="text-xs font-bold tracking-[0.18em] uppercase mb-2 flex items-center gap-1.5"
                        style={{ color: '#0284C7' }}
                      >
                        <span className="w-2.5 h-0.5 bg-sky-600 inline-block" />
                        <span>W O R K &nbsp; E X P E R I E N C E</span>
                      </h2>
                      <div className="space-y-3">
                        {page2Experiences.map((exp) => (
                          <div key={exp.id} className="text-[10.5px] leading-snug">
                            <div className="flex justify-between items-baseline font-bold">
                              <span className="text-[12px]" style={{ color: '#1E3A5F' }}>
                                {exp.jobTitle}
                              </span>
                              <span className="text-[10px] text-slate-600 font-medium font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                                {exp.duration}
                              </span>
                            </div>
                            <div className="text-slate-600 italic text-[10.5px] mb-1">
                              {exp.company} {exp.location ? `• ${exp.location}` : ''}
                            </div>
                            {exp.highlights && exp.highlights.length > 0 && (
                              <ul className="list-disc pl-4 space-y-1 text-slate-700 mb-1 leading-relaxed text-[10.5px]">
                                {exp.highlights.map((h, i) => (
                                  <li key={i}>{h}</li>
                                ))}
                              </ul>
                            )}
                            {exp.achievements && exp.achievements.length > 0 && (
                              <div className="mt-1 pl-2.5 border-l-2 border-sky-500 bg-sky-50/70 py-1.5 pr-2.5 rounded-r">
                                <span className="font-bold text-[10px] uppercase tracking-wider text-sky-900 block mb-0.5 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-sky-600 shrink-0" />
                                  <span>Key Metric Achievements:</span>
                                </span>
                                <ul className="list-disc pl-3.5 space-y-0.5 text-slate-700 leading-normal text-[10px]">
                                  {exp.achievements.map((ach, i) => (
                                    <li key={i}>{ach}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education on Page 2 */}
                  {page2HasEducation && data.education && data.education.length > 0 && (
                    <div>
                      <h2
                        className="text-xs font-bold tracking-[0.18em] uppercase mb-2 flex items-center gap-1.5"
                        style={{ color: '#0284C7' }}
                      >
                        <span className="w-2.5 h-0.5 bg-sky-600 inline-block" />
                        <span>E D U C A T I O N &nbsp; Q U A L I F I C A T I O N</span>
                      </h2>
                      <div className="space-y-2">
                        {data.education.map((edu) => (
                          <div key={edu.id} className="text-[10.5px] leading-snug">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900 text-[11px]">{edu.school}</span>
                              <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                                {edu.duration}
                              </span>
                            </div>
                            <div className="text-slate-600 italic text-[10.5px]">{edu.degree}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Page 2 Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end text-[9.5px] text-slate-400 font-mono">
                  <span>Page 2 of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // TEMPLATE 2: ATS Corporate Clean (Wall Street & Fortune 500)
  // ----------------------------------------------------
  const renderAtsCorporateClean = () => {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* PAGE 1 */}
        <div className="w-[210mm] shrink-0">
          <div
            className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-8 sm:p-9 bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
            style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
          >
            <div className="space-y-4">
              {/* Corporate Header with Photo Preset & Dynamic Alignment */}
              {photoAlignment === 'center' ? (
                <div className="flex flex-col items-center text-center gap-2 pb-2.5 border-b-2 border-slate-900">
                  {renderCandidatePhoto('w-20 h-20', 'border-2 border-slate-300 shadow-sm')}
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-wider text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-x-2.5 text-[10.5px] text-slate-600 mt-1.5 font-medium">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>• {data.personal.phone}</span>}
                      {data.personal.location && <span>• {data.personal.location}</span>}
                      {data.personal.availability && (
                        <span className="font-bold text-slate-900">• {data.personal.availability}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : photoAlignment === 'left' ? (
                <div className="flex items-center gap-4 pb-2.5 border-b-2 border-slate-900">
                  {renderCandidatePhoto('w-20 h-20', 'border-2 border-slate-300 shadow-sm')}
                  <div className="flex-1 text-left">
                    <h1 className="text-2xl font-black uppercase tracking-wider text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2.5 text-[10.5px] text-slate-600 mt-1.5 font-medium">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>• {data.personal.phone}</span>}
                      {data.personal.location && <span>• {data.personal.location}</span>}
                      {data.personal.availability && (
                        <span className="font-bold text-slate-900">• {data.personal.availability}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 pb-2.5 border-b-2 border-slate-900">
                  <div className="flex-1 text-left">
                    <h1 className="text-2xl font-black uppercase tracking-wider text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2.5 text-[10.5px] text-slate-600 mt-1.5 font-medium">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>• {data.personal.phone}</span>}
                      {data.personal.location && <span>• {data.personal.location}</span>}
                      {data.personal.availability && (
                        <span className="font-bold text-slate-900">• {data.personal.availability}</span>
                      )}
                    </div>
                  </div>
                  {renderCandidatePhoto('w-20 h-20', 'border-2 border-slate-300 shadow-sm')}
                </div>
              )}

              {/* Professional Summary */}
              {data.summary && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-1.5">
                    Professional Summary
                  </h2>
                  <p className="text-[10.5px] leading-relaxed text-slate-800 text-left">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Core Competencies (Linear ATS Table Grid) */}
              {data.skills && data.skills.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-1.5">
                    Core Competencies & Functional Expertise
                  </h2>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[10.5px] text-slate-800">
                    {data.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">•</span>
                        <span>{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Experience on Page 1 */}
              {page1Experiences.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-2">
                    Professional Experience
                  </h2>
                  <div className="space-y-3.5">
                    {page1Experiences.map((exp) => (
                      <div key={exp.id} className="text-[10.5px]">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-950 text-[11px] uppercase tracking-wide">
                            {exp.jobTitle}
                          </span>
                          <span className="font-bold text-slate-700 text-[10px]">
                            {exp.duration}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-slate-700 mb-1">
                          <span>{exp.company}</span>
                          <span className="text-[10px] not-italic text-slate-600">
                            {exp.location}
                          </span>
                        </div>
                        {exp.highlights && (
                          <ul className="list-disc pl-4 space-y-1 text-slate-800 mb-1 leading-relaxed">
                            {exp.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mt-1 pl-3 text-slate-800">
                            <span className="font-bold text-[10px] uppercase text-slate-900">
                              Key Metric Achievements:
                            </span>
                            <ul className="list-circle pl-4 space-y-0.5 text-slate-800">
                              {exp.achievements.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education on Page 1 if capacity allows */}
              {page1HasEducation && data.education && data.education.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-1.5">
                    Education & Credentials
                  </h2>
                  <div className="space-y-1.5">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-baseline text-[10.5px]">
                        <div>
                          <span className="font-bold text-slate-950">{edu.school}</span>
                          <span className="italic text-slate-700"> — {edu.degree}</span>
                        </div>
                        <span className="text-slate-600 font-medium text-[10px]">{edu.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards / Certificates on Page 1 if capacity allows */}
              {page1HasAwards && data.awards && data.awards.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-1.5">
                    Awards / Certificates
                  </h2>
                  <div className="space-y-1 text-[10.5px] text-slate-800">
                    {data.awards.map((aw) => (
                      <div key={aw.id} className="flex items-center justify-between">
                        <span className="font-semibold">• {aw.title}</span>
                        <span className="text-[10px] text-slate-500">{aw.years}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
              <span>Page 1 of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        {isMultiPage && (
          <div className="w-[210mm] shrink-0">
            <div
              className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-8 sm:p-9 bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
              style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b-2 border-slate-900 pb-1.5">
                  <span className="text-sm font-black uppercase text-slate-950 tracking-wider">
                    {data.personal.fullName || 'Candidate'}
                  </span>
                  {data.personal.headline && (
                    <span className="text-xs text-slate-600 uppercase tracking-wider">
                      {data.personal.headline}
                    </span>
                  )}
                </div>

                {/* Remaining Work Experience */}
                {page2Experiences.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-2">
                      Professional Experience
                    </h2>
                    <div className="space-y-3.5">
                      {page2Experiences.map((exp) => (
                        <div key={exp.id} className="text-[10.5px]">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-950 text-[11px] uppercase tracking-wide">
                              {exp.jobTitle}
                            </span>
                            <span className="font-bold text-slate-700 text-[10px]">
                              {exp.duration}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline italic text-slate-700 mb-1">
                            <span>{exp.company}</span>
                            <span className="text-[10px] not-italic text-slate-600">
                              {exp.location}
                            </span>
                          </div>
                          {exp.highlights && (
                            <ul className="list-disc pl-4 space-y-1 text-slate-800 mb-1 leading-relaxed">
                              {exp.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="mt-1 pl-3 text-slate-800">
                              <span className="font-bold text-[10px] uppercase text-slate-900">
                                Key Metric Achievements:
                              </span>
                              <ul className="list-circle pl-4 space-y-0.5 text-slate-800">
                                {exp.achievements.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education on Page 2 */}
                {page2HasEducation && data.education && data.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-1.5">
                      Education & Academic Credentials
                    </h2>
                    <div className="space-y-2">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-baseline text-[10.5px]">
                          <div>
                            <span className="font-bold text-slate-950">{edu.school}</span>
                            <span className="italic text-slate-700"> — {edu.degree}</span>
                          </div>
                          <span className="text-slate-600 font-medium text-[10px]">{edu.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards / Certificates on Page 2 */}
                {page2HasAwards && data.awards && data.awards.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b-2 border-slate-900 pb-0.5 mb-1.5">
                      Awards / Certificates
                    </h2>
                    <div className="space-y-1 text-[10.5px] text-slate-800">
                      {data.awards.map((aw) => (
                        <div key={aw.id} className="flex items-center justify-between">
                          <span className="font-semibold">• {aw.title}</span>
                          <span className="text-[10px] text-slate-500">{aw.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
                <span>Page 2 of {totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // TEMPLATE 3: ATS Modern Tech Accent (Silicon Valley / Tech)
  // ----------------------------------------------------
  const renderAtsModernAccent = () => {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* PAGE 1 */}
        <div className="w-[210mm] shrink-0">
          <div
            className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
            style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
          >
            <div className="h-2 bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 w-full" />

            <div className="p-8 sm:p-9 flex-1 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Modern Tech Header with Photo Preset & Dynamic Alignment */}
                {photoAlignment === 'center' ? (
                  <div className="flex flex-col items-center text-center gap-2 border-b border-slate-200 pb-3">
                    {renderCandidatePhoto('w-18 h-18', 'border-2 border-sky-300 shadow-sm')}
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-950">
                        {renderDisplayName(data.personal.fullName)}
                      </h1>
                      {data.personal.headline && (
                        <p className="text-xs font-bold text-sky-700 tracking-wide uppercase mt-0.5">
                          {data.personal.headline}
                        </p>
                      )}
                    </div>
                    {data.personal.availability && (
                      <span className="px-2.5 py-0.5 bg-sky-50 text-sky-800 border border-sky-300 rounded-md text-[10px] font-bold">
                        {data.personal.availability}
                      </span>
                    )}
                  </div>
                ) : photoAlignment === 'right' ? (
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-950">
                        {renderDisplayName(data.personal.fullName)}
                      </h1>
                      {data.personal.headline && (
                        <p className="text-xs font-bold text-sky-700 tracking-wide uppercase mt-0.5">
                          {data.personal.headline}
                        </p>
                      )}
                      {data.personal.availability && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-sky-50 text-sky-800 border border-sky-300 rounded-md text-[10px] font-bold">
                          {data.personal.availability}
                        </span>
                      )}
                    </div>
                    {renderCandidatePhoto('w-18 h-18', 'border-2 border-sky-300 shadow-sm')}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3.5">
                      {renderCandidatePhoto('w-18 h-18', 'border-2 border-sky-300 shadow-sm')}
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-950">
                          {renderDisplayName(data.personal.fullName)}
                        </h1>
                        {data.personal.headline && (
                          <p className="text-xs font-bold text-sky-700 tracking-wide uppercase mt-0.5">
                            {data.personal.headline}
                          </p>
                        )}
                      </div>
                    </div>
                    {data.personal.availability && (
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-300 rounded-md text-[10px] font-bold">
                        {data.personal.availability}
                      </span>
                    )}
                  </div>
                )}

                {/* Contact Badges */}
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 font-medium">
                  {data.personal.email && (
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                      ✉ {data.personal.email}
                    </span>
                  )}
                  {data.personal.phone && (
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                      ☎ {data.personal.phone}
                    </span>
                  )}
                  {data.personal.location && (
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                      📍 {data.personal.location}
                    </span>
                  )}
                </div>

                {data.summary && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-1.5">
                      Executive Summary
                    </h2>
                    <p className="text-[10.5px] leading-relaxed text-slate-700">
                      {data.summary}
                    </p>
                  </div>
                )}

                {data.skills && data.skills.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-2">
                      Technical Stack & Core Skills
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-0.5 bg-slate-50 border border-slate-300 text-slate-800 text-[10.5px] rounded font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {page1Experiences.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-2.5">
                      Experience & Architecture History
                    </h2>
                    <div className="space-y-3">
                      {page1Experiences.map((exp) => (
                        <div key={exp.id} className="text-[10.5px]">
                          <div className="flex justify-between items-baseline font-bold text-slate-950">
                            <span className="text-[11.5px] text-sky-950">{exp.jobTitle}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {exp.duration}
                            </span>
                          </div>
                          <div className="text-slate-600 italic text-[10.5px] mb-1">
                            {exp.company} • {exp.location}
                          </div>
                          {exp.highlights && (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-700 leading-relaxed mb-1">
                              {exp.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="p-2 bg-sky-50/60 border border-sky-200/80 rounded mt-1">
                              <span className="font-bold text-[10px] text-sky-900 block mb-0.5">
                                ★ Key Engineering & Metric Achievements:
                              </span>
                              <ul className="list-disc pl-3 space-y-0.5 text-slate-700">
                                {exp.achievements.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education on Page 1 if capacity allows */}
                {page1HasEducation && data.education && data.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-2">
                      Education & Academic Credentials
                    </h2>
                    <div className="space-y-2">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="text-[10.5px]">
                          <div className="flex justify-between items-baseline font-bold text-slate-900">
                            <span>{edu.school}</span>
                            <span className="text-slate-500 text-[10px]">{edu.duration}</span>
                          </div>
                          <span className="text-slate-600 italic">{edu.degree}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards / Certificates on Page 1 */}
                {page1HasAwards && data.awards && data.awards.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-2">
                      Awards / Certificates
                    </h2>
                    <div className="space-y-1 text-[10.5px] text-slate-700">
                      {data.awards.map((aw) => (
                        <div key={aw.id} className="flex justify-between">
                          <span>🏅 {aw.title}</span>
                          <span className="text-[10px] text-slate-500">{aw.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
                <span>Page 1 of {totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        {isMultiPage && (
          <div className="w-[210mm] shrink-0">
            <div
              className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
              style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
            >
              <div className="h-2 bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 w-full" />

              <div className="p-8 sm:p-9 flex-1 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-b border-slate-200 pb-2">
                    <span className="text-base font-bold text-slate-950">
                      {data.personal.fullName || 'Candidate'}
                    </span>
                    {data.personal.headline && (
                      <span className="text-xs text-sky-700 uppercase tracking-wider font-semibold">
                        {data.personal.headline}
                      </span>
                    )}
                  </div>

                  {/* Overflow Experience */}
                  {page2Experiences.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-2.5">
                        Professional Experience
                      </h2>
                      <div className="space-y-3">
                        {page2Experiences.map((exp) => (
                          <div key={exp.id} className="text-[10.5px]">
                            <div className="flex justify-between items-baseline font-bold text-slate-950">
                              <span className="text-[11.5px] text-sky-950">{exp.jobTitle}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {exp.duration}
                              </span>
                            </div>
                            <div className="text-slate-600 italic text-[10.5px] mb-1">
                              {exp.company} • {exp.location}
                            </div>
                            {exp.highlights && (
                              <ul className="list-disc pl-4 space-y-0.5 text-slate-700 leading-relaxed mb-1">
                                {exp.highlights.map((h, i) => (
                                  <li key={i}>{h}</li>
                                ))}
                              </ul>
                            )}
                            {exp.achievements && exp.achievements.length > 0 && (
                              <div className="p-2 bg-sky-50/60 border border-sky-200/80 rounded mt-1">
                                <span className="font-bold text-[10px] text-sky-900 block mb-0.5">
                                  ★ Key Engineering & Metric Achievements:
                                </span>
                                <ul className="list-disc pl-3 space-y-0.5 text-slate-700">
                                  {exp.achievements.map((a, i) => (
                                    <li key={i}>{a}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education on Page 2 */}
                  {page2HasEducation && data.education && data.education.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-2">
                        Education & Certifications
                      </h2>
                      <div className="space-y-2">
                        {data.education.map((edu) => (
                          <div key={edu.id} className="text-[10.5px]">
                            <div className="flex justify-between items-baseline font-bold text-slate-900">
                              <span>{edu.school}</span>
                              <span className="text-slate-500 text-[10px]">{edu.duration}</span>
                            </div>
                            <span className="text-slate-600 italic">{edu.degree}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Awards / Certificates on Page 2 */}
                  {page2HasAwards && data.awards && data.awards.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-l-4 border-sky-600 pl-2.5 mb-2">
                        Awards / Certificates
                      </h2>
                      <div className="space-y-1 text-[10.5px] text-slate-700">
                        {data.awards.map((aw) => (
                          <div key={aw.id} className="flex justify-between">
                            <span>🏅 {aw.title}</span>
                            <span className="text-[10px] text-slate-500">{aw.years}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
                  <span>Page 2 of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // TEMPLATE 4: ATS Executive Hybrid (C-Suite & VP)
  // ----------------------------------------------------
  const renderAtsExecutiveHybrid = () => {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* PAGE 1 */}
        <div className="w-[210mm] shrink-0">
          <div
            className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-8 sm:p-9 bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
            style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
          >
            <div className="space-y-4">
              {/* Executive Header Banner with Photo Preset & Dynamic Alignment */}
              {photoAlignment === 'center' ? (
                <div className="pb-3 border-b-2 border-slate-900 flex flex-col items-center text-center gap-2.5">
                  {renderCandidatePhoto('w-20 h-20', 'border-2 border-slate-400 shadow-md')}
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-800 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-x-3 text-[10px] text-slate-600 mt-1">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>| {data.personal.phone}</span>}
                      {data.personal.location && <span>| {data.personal.location}</span>}
                    </div>
                  </div>
                  {data.personal.availability && (
                    <div className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold tracking-wider uppercase text-center">
                      {data.personal.availability}
                    </div>
                  )}
                </div>
              ) : photoAlignment === 'right' ? (
                <div className="pb-3 border-b-2 border-slate-900 flex justify-between items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-800 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-600 mt-1">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>| {data.personal.phone}</span>}
                      {data.personal.location && <span>| {data.personal.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {data.personal.availability && (
                      <div className="px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold tracking-wider uppercase text-center shrink-0">
                        {data.personal.availability}
                      </div>
                    )}
                    {renderCandidatePhoto('w-20 h-20', 'border-2 border-slate-400 shadow-md')}
                  </div>
                </div>
              ) : (
                <div className="pb-3 border-b-2 border-slate-900 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3.5">
                    {renderCandidatePhoto('w-20 h-20', 'border-2 border-slate-400 shadow-md')}
                    <div>
                      <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">
                        {renderDisplayName(data.personal.fullName)}
                      </h1>
                      {data.personal.headline && (
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-800 mt-0.5">
                          {data.personal.headline}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-600 mt-1">
                        {data.personal.email && <span>{data.personal.email}</span>}
                        {data.personal.phone && <span>| {data.personal.phone}</span>}
                        {data.personal.location && <span>| {data.personal.location}</span>}
                      </div>
                    </div>
                  </div>

                  {data.personal.availability && (
                    <div className="px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold tracking-wider uppercase text-center shrink-0">
                      {data.personal.availability}
                    </div>
                  )}
                </div>
              )}

              {data.summary && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                    <span>Executive Profile & Leadership Scope</span>
                  </h2>
                  <p className="text-[10.5px] leading-relaxed text-slate-800 text-left">
                    {data.summary}
                  </p>
                </div>
              )}

              {data.skills && data.skills.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                    <span>Executive Core Competencies</span>
                  </h2>
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded">
                    {data.skills.map((skill) => (
                      <div key={skill.id} className="text-[10.5px] text-slate-800 font-medium">
                        ✓ {skill.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience on Page 1 */}
              {page1Experiences.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                    <span>Executive Career History & Key Milestones</span>
                  </h2>
                  <div className="space-y-3">
                    {page1Experiences.map((exp) => (
                      <div key={exp.id} className="text-[10.5px]">
                        <div className="flex justify-between items-baseline font-bold">
                          <span className="text-[11.5px] text-slate-950">{exp.jobTitle}</span>
                          <span className="text-[10px] text-slate-600">{exp.duration}</span>
                        </div>
                        <div className="text-slate-600 italic text-[10.5px] mb-1">
                          {exp.company} • {exp.location}
                        </div>
                        {exp.highlights && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-800 leading-relaxed mb-1">
                            {exp.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="p-2 bg-sky-50/50 border-l-2 border-sky-600 rounded-r mt-1">
                            <span className="font-bold text-[10px] text-sky-950 uppercase tracking-wide block mb-0.5">
                              Strategic Milestone Impacts:
                            </span>
                            <ul className="list-disc pl-3 space-y-0.5 text-slate-800">
                              {exp.achievements.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education on Page 1 */}
              {page1HasEducation && data.education && data.education.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                    <span>Educational Qualifications</span>
                  </h2>
                  <div className="space-y-1.5">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="flex justify-between text-[10.5px]">
                        <div>
                          <span className="font-bold text-slate-900">{edu.school}</span>
                          <span className="text-slate-700 italic"> — {edu.degree}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{edu.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards / Certificates on Page 1 */}
              {page1HasAwards && data.awards && data.awards.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                    <span>Awards / Certificates</span>
                  </h2>
                  <div className="space-y-1 text-[10.5px] text-slate-800">
                    {data.awards.map((aw) => (
                      <div key={aw.id} className="flex justify-between">
                        <span>• {aw.title}</span>
                        <span className="text-[10px] text-slate-500">{aw.years}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
              <span>Page 1 of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        {isMultiPage && (
          <div className="w-[210mm] shrink-0">
            <div
              className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-8 sm:p-9 bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
              style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b-2 border-slate-900 pb-1.5">
                  <span className="text-sm font-black uppercase text-slate-950">
                    {data.personal.fullName || 'Candidate'}
                  </span>
                  {data.personal.headline && (
                    <span className="text-xs text-slate-600 uppercase tracking-wider">
                      {data.personal.headline}
                    </span>
                  )}
                </div>

                {/* Overflow Experience */}
                {page2Experiences.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                      <span>Professional Experience</span>
                    </h2>
                    <div className="space-y-3">
                      {page2Experiences.map((exp) => (
                        <div key={exp.id} className="text-[10.5px]">
                          <div className="flex justify-between items-baseline font-bold">
                            <span className="text-[11.5px] text-slate-950">{exp.jobTitle}</span>
                            <span className="text-[10px] text-slate-600">{exp.duration}</span>
                          </div>
                          <div className="text-slate-600 italic text-[10.5px] mb-1">
                            {exp.company} • {exp.location}
                          </div>
                          {exp.highlights && (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-800 leading-relaxed mb-1">
                              {exp.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="p-2 bg-sky-50/50 border-l-2 border-sky-600 rounded-r mt-1">
                              <span className="font-bold text-[10px] text-sky-950 uppercase tracking-wide block mb-0.5">
                                Strategic Milestone Impacts:
                              </span>
                              <ul className="list-disc pl-3 space-y-0.5 text-slate-800">
                                {exp.achievements.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education on Page 2 */}
                {page2HasEducation && data.education && data.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                      <span>Educational Qualifications & Diplomas</span>
                    </h2>
                    <div className="space-y-1.5">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between text-[10.5px]">
                          <div>
                            <span className="font-bold text-slate-900">{edu.school}</span>
                            <span className="text-slate-700 italic"> — {edu.degree}</span>
                          </div>
                          <span className="text-slate-500 text-[10px]">{edu.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards / Certificates on Page 2 */}
                {page2HasAwards && data.awards && data.awards.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-sky-700 rounded-sm" />
                      <span>Awards / Certificates</span>
                    </h2>
                    <div className="space-y-1 text-[10.5px] text-slate-800">
                      {data.awards.map((aw) => (
                        <div key={aw.id} className="flex justify-between">
                          <span>• {aw.title}</span>
                          <span className="text-[10px] text-slate-500">{aw.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
                <span>Page 2 of {totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // TEMPLATE 5: ATS Classic Minimalist (Universal Parse)
  // ----------------------------------------------------
  const renderAtsSingleColumn = () => {
    return (
      <div className="flex flex-col items-center gap-8">
        {/* PAGE 1 */}
        <div className="w-[210mm] shrink-0">
          <div
            className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-8 sm:p-9 bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
            style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
          >
            <div className="space-y-3.5">
              {/* Minimalist Header with Photo Preset & Dynamic Alignment */}
              {photoAlignment === 'center' ? (
                <div className="border-b border-slate-300 pb-2.5 flex flex-col items-center text-center gap-2">
                  {renderCandidatePhoto('w-18 h-18', 'border border-slate-300 shadow-sm')}
                  <div>
                    <h1 className="text-xl font-bold uppercase tracking-wide text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-medium text-slate-700 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="text-[10.5px] text-slate-600 mt-1 flex flex-wrap justify-center gap-2">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>| {data.personal.phone}</span>}
                      {data.personal.location && <span>| {data.personal.location}</span>}
                      {data.personal.availability && (
                        <span className="font-semibold text-slate-900">
                          | {data.personal.availability}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : photoAlignment === 'left' ? (
                <div className="border-b border-slate-300 pb-2 flex items-center gap-4">
                  {renderCandidatePhoto('w-18 h-18', 'border border-slate-300 shadow-sm')}
                  <div className="flex-1">
                    <h1 className="text-xl font-bold uppercase tracking-wide text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-medium text-slate-700 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="text-[10.5px] text-slate-600 mt-1 flex flex-wrap gap-2">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>| {data.personal.phone}</span>}
                      {data.personal.location && <span>| {data.personal.location}</span>}
                      {data.personal.availability && (
                        <span className="font-semibold text-slate-900">
                          | {data.personal.availability}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-b border-slate-300 pb-2 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold uppercase tracking-wide text-slate-950">
                      {renderDisplayName(data.personal.fullName)}
                    </h1>
                    {data.personal.headline && (
                      <p className="text-xs font-medium text-slate-700 mt-0.5">
                        {data.personal.headline}
                      </p>
                    )}
                    <div className="text-[10.5px] text-slate-600 mt-1 flex flex-wrap gap-2">
                      {data.personal.email && <span>{data.personal.email}</span>}
                      {data.personal.phone && <span>| {data.personal.phone}</span>}
                      {data.personal.location && <span>| {data.personal.location}</span>}
                      {data.personal.availability && (
                        <span className="font-semibold text-slate-900">
                          | {data.personal.availability}
                        </span>
                      )}
                    </div>
                  </div>

                  {renderCandidatePhoto('w-18 h-18', 'border border-slate-300 shadow-sm')}
                </div>
              )}

              {data.summary && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-1">
                    Summary
                  </h2>
                  <p className="text-[10.5px] leading-relaxed text-slate-800">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Work Experience */}
              {page1Experiences.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-2">
                    Work Experience
                  </h2>
                  <div className="space-y-3">
                    {page1Experiences.map((exp) => (
                      <div key={exp.id} className="text-[10.5px]">
                        <div className="flex justify-between items-baseline font-bold text-slate-950">
                          <span>{exp.jobTitle}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {exp.duration}
                          </span>
                        </div>
                        <div className="text-slate-600 italic text-[10.5px] mb-1">
                          {exp.company} {exp.location ? `• ${exp.location}` : ''}
                        </div>
                        {exp.highlights && (
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-700 leading-relaxed mb-1">
                            {exp.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="pl-3 mt-1 text-slate-800">
                            <span className="font-bold text-[10px] text-slate-900">
                              Key Achievements:
                            </span>
                            <ul className="list-circle pl-4 space-y-0.5">
                              {exp.achievements.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {data.skills && data.skills.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-1">
                    Skills
                  </h2>
                  <p className="text-[10.5px] text-slate-800 leading-relaxed">
                    {data.skills.map((s) => s.name).join(' • ')}
                  </p>
                </div>
              )}

              {/* Education on Page 1 */}
              {page1HasEducation && data.education && data.education.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-1.5">
                    Education
                  </h2>
                  <div className="space-y-1.5">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="flex justify-between text-[10.5px]">
                        <div>
                          <span className="font-bold text-slate-900">{edu.school}</span>
                          <span className="text-slate-700 italic"> — {edu.degree}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{edu.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards / Certificates on Page 1 */}
              {page1HasAwards && data.awards && data.awards.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-1.5">
                    Awards / Certificates
                  </h2>
                  <div className="space-y-1 text-[10.5px] text-slate-800">
                    {data.awards.map((aw) => (
                      <div key={aw.id} className="flex justify-between">
                        <span>• {aw.title}</span>
                        <span className="text-[10px] text-slate-500">{aw.years}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
              <span>Page 1 of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        {isMultiPage && (
          <div className="w-[210mm] shrink-0">
            <div
              className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-8 sm:p-9 bg-white text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden font-sans"
              style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
            >
              <div className="space-y-3.5">
                <div className="border-b border-slate-200 pb-1.5 flex justify-between">
                  <span className="text-sm font-bold uppercase text-slate-950">
                    {data.personal.fullName || 'Candidate'}
                  </span>
                  {data.personal.headline && (
                    <span className="text-xs text-slate-500 uppercase">{data.personal.headline}</span>
                  )}
                </div>

                {page2Experiences.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-2">
                      Professional Experience
                    </h2>
                    <div className="space-y-3">
                      {page2Experiences.map((exp) => (
                        <div key={exp.id} className="text-[10.5px]">
                          <div className="flex justify-between items-baseline font-bold text-slate-950">
                            <span>{exp.jobTitle}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {exp.duration}
                            </span>
                          </div>
                          <div className="text-slate-600 italic text-[10.5px] mb-1">
                            {exp.company} {exp.location ? `• ${exp.location}` : ''}
                          </div>
                          {exp.highlights && (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-700 leading-relaxed mb-1">
                              {exp.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="pl-3 mt-1 text-slate-800">
                              <span className="font-bold text-[10px] text-slate-900">
                                Key Achievements:
                              </span>
                              <ul className="list-circle pl-4 space-y-0.5">
                                {exp.achievements.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education on Page 2 */}
                {page2HasEducation && data.education && data.education.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-1.5">
                      Education
                    </h2>
                    <div className="space-y-1.5">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between text-[10.5px]">
                          <div>
                            <span className="font-bold text-slate-900">{edu.school}</span>
                            <span className="text-slate-700 italic"> — {edu.degree}</span>
                          </div>
                          <span className="text-slate-500 text-[10px]">{edu.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards / Certificates on Page 2 */}
                {page2HasAwards && data.awards && data.awards.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-0.5 mb-1.5">
                      Awards / Certificates
                    </h2>
                    <div className="space-y-1 text-[10.5px] text-slate-800">
                      {data.awards.map((aw) => (
                        <div key={aw.id} className="flex justify-between">
                          <span>• {aw.title}</span>
                          <span className="text-[10px] text-slate-500">{aw.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end text-[9.5px] text-slate-500 font-mono">
                <span>Page 2 of {totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEmptyResumeSheet = () => {
    return (
      <div className="flex flex-col items-center">
        <div className="w-[210mm] shrink-0">
          <div
            className="resume-page-sheet w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-800 flex shadow-2xl relative overflow-hidden"
            style={{ width: '210mm', height: '297mm', maxHeight: '297mm' }}
          >
            {templateStyle === 'executive-two-column' ? (
              <>
                {/* Left 33% Navy Sidebar Skeleton */}
                <div
                  className="w-[33%] p-6 text-white flex flex-col justify-between shrink-0 h-full"
                  style={{ backgroundColor: '#1E3A5F' }}
                >
                  <div className="space-y-5">
                    {/* Photo outline */}
                    <div className="flex flex-col items-start w-full">
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-sky-400/40 bg-slate-800/60 flex flex-col items-center justify-center text-slate-400">
                        <User className="w-8 h-8 text-sky-300/60 mb-1" />
                        <span className="text-[9px] text-sky-200/70 font-semibold tracking-wider uppercase">Photo</span>
                      </div>
                    </div>

                    {/* Contact skeleton */}
                    <div className="space-y-2 pt-2 border-t border-sky-400/20">
                      <span className="text-[10px] font-bold text-sky-300 tracking-[0.18em] uppercase">Contact Details</span>
                      <div className="space-y-2">
                        <div className="h-3 bg-sky-200/10 rounded w-4/5" />
                        <div className="h-3 bg-sky-200/10 rounded w-full" />
                        <div className="h-3 bg-sky-200/10 rounded w-3/4" />
                      </div>
                    </div>

                    {/* Skills skeleton */}
                    <div className="space-y-2 pt-3 border-t border-sky-400/20">
                      <span className="text-[10px] font-bold text-sky-300 tracking-[0.18em] uppercase">Skills Summary</span>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center"><div className="h-2.5 bg-sky-200/15 rounded w-1/2" /><div className="h-2 bg-sky-200/20 rounded w-12" /></div>
                        <div className="flex justify-between items-center"><div className="h-2.5 bg-sky-200/15 rounded w-2/3" /><div className="h-2 bg-sky-200/20 rounded w-12" /></div>
                        <div className="flex justify-between items-center"><div className="h-2.5 bg-sky-200/15 rounded w-3/5" /><div className="h-2 bg-sky-200/20 rounded w-12" /></div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[9px] text-sky-300/50 font-mono">
                    Executive Two-Column • Blank
                  </div>
                </div>

                {/* Right 67% Body */}
                <div className="w-[67%] p-7 bg-white flex flex-col justify-between text-slate-800 h-full">
                  <div className="space-y-5">
                    {/* Header placeholder */}
                    <div className="border-b-2 border-slate-200 pb-3">
                      <div className="h-7 bg-slate-200/80 rounded w-3/5 mb-1.5" />
                      <div className="h-3.5 bg-slate-100 rounded w-2/5" />
                    </div>

                    {/* Central Empty State Callout Card */}
                    <div className="p-6 rounded-2xl border-2 border-dashed border-sky-300 bg-gradient-to-b from-sky-50/80 to-slate-50 text-center space-y-3 shadow-sm">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                          Empty Resume Canvas
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                          Your resume is currently blank. Upload your existing resume (PDF, Word, or TXT) to automatically extract and populate all fields, or fill them in using the editor.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2.5 pt-1">
                        {onOpenUploadModal && (
                          <button
                            type="button"
                            onClick={onOpenUploadModal}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Resume File</span>
                          </button>
                        )}
                        {onLoadSample && (
                          <button
                            type="button"
                            onClick={onLoadSample}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                            <span>Load Demo Sample</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section Skeletons (Summary & Work Experience) */}
                    <div className="space-y-4 pt-1">
                      <div className="space-y-1.5">
                        <div className="h-3 bg-slate-300/80 rounded w-1/4" />
                        <div className="space-y-1">
                          <div className="h-2 bg-slate-100 rounded w-full" />
                          <div className="h-2 bg-slate-100 rounded w-11/12" />
                          <div className="h-2 bg-slate-100 rounded w-4/5" />
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="h-3 bg-slate-300/80 rounded w-1/3" />
                        <div className="p-3 border border-dashed border-slate-200 rounded-lg space-y-1.5">
                          <div className="flex justify-between">
                            <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                            <div className="h-2.5 bg-slate-100 rounded w-1/5" />
                          </div>
                          <div className="h-2 bg-slate-100 rounded w-1/4" />
                          <div className="h-2 bg-slate-100 rounded w-full" />
                          <div className="h-2 bg-slate-100 rounded w-5/6" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
                    <span>Upload resume or fill form to populate fields</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </>
            ) : (
              /* Single-Column / ATS Layout Empty Canvas */
              <div className="w-full h-full p-8 sm:p-9 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Template-specific Accent Header Bar */}
                  {templateStyle === 'ats-modern-accent' && (
                    <div className="h-2 bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 -mx-9 -mt-9 mb-5" />
                  )}
                  {templateStyle === 'ats-executive-hybrid' && (
                    <div className="h-2.5 bg-gradient-to-r from-slate-900 to-indigo-900 -mx-9 -mt-9 mb-5" />
                  )}
                  {templateStyle === 'ats-single-column' && (
                    <div className="h-1 bg-slate-800 -mx-9 -mt-9 mb-5" />
                  )}

                  {/* Header Wireframe */}
                  <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-7 bg-slate-200 rounded w-64" />
                      <div className="h-3.5 bg-slate-100 rounded w-44" />
                      <div className="h-2.5 bg-slate-100 rounded w-72" />
                    </div>
                    <div className="w-16 h-16 rounded border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <User className="w-6 h-6 text-slate-300" />
                    </div>
                  </div>

                  {/* Central Empty State Callout Card */}
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3 shadow-sm">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                        Empty Resume Canvas ({currentTemplate.name})
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                        No fields have been populated yet. Upload your existing resume to extract and auto-fill all sections into this {currentTemplate.name} layout ({currentTemplate.atsScore}% ATS rating).
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2.5 pt-1">
                      {onOpenUploadModal && (
                        <button
                          type="button"
                          onClick={onOpenUploadModal}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Resume File</span>
                        </button>
                      )}
                      {onLoadSample && (
                        <button
                          type="button"
                          onClick={onLoadSample}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Load Demo Sample</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section Outlines */}
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-900/80 rounded w-1/4" />
                      <div className="space-y-1">
                        <div className="h-2 bg-slate-100 rounded w-full" />
                        <div className="h-2 bg-slate-100 rounded w-11/12" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="h-3 bg-slate-900/80 rounded w-1/3" />
                      <div className="p-3 border border-dashed border-slate-200 rounded-lg space-y-1.5">
                        <div className="flex justify-between">
                          <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                          <div className="h-2.5 bg-slate-100 rounded w-1/5" />
                        </div>
                        <div className="h-2 bg-slate-100 rounded w-1/4" />
                        <div className="h-2 bg-slate-100 rounded w-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
                  <span>ATS-Optimized Resume Template • Ready to Populate</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveResumeSheets = () => {
    if (isResumeEmpty) {
      return renderEmptyResumeSheet();
    }
    switch (templateStyle) {
      case 'ats-corporate-clean':
        return renderAtsCorporateClean();
      case 'ats-modern-accent':
        return renderAtsModernAccent();
      case 'ats-executive-hybrid':
        return renderAtsExecutiveHybrid();
      case 'ats-single-column':
        return renderAtsSingleColumn();
      case 'executive-two-column':
      default:
        return renderExecutiveTwoColumn();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Floating Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md no-print">
        {/* Left: Template Selector Button & ATS Score Badge */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (onOpenTemplateSelector) onOpenTemplateSelector();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Format: {currentTemplate.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* ATS Compatibility Pill */}
          <button
            onClick={onOpenAtsOptimizer}
            title="Click to view full ATS scanner audit and keyword checklist"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold rounded-xl transition-all shadow-sm group"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>ATS {atsAnalysis.score}%</span>
            <span className="text-[10px] text-emerald-400/80 hidden sm:inline">Grade {atsAnalysis.grade}</span>
          </button>
        </div>

        {/* Center: Formatting & Density Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Cell Padding / Spacing Toggle */}
          <button
            onClick={() =>
              setDensity((prev) => (prev === 'comfortable' ? 'compact' : 'comfortable'))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl border border-slate-700/80 transition-colors shadow-sm"
            title="Toggle between comfortable and compact document padding"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spacing: {density === 'comfortable' ? 'Comfortable' : 'Compact'}</span>
          </button>

          {/* Photo Alignment Quick Toggle */}
          {onChangePhotoAlignment && (
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs">
              <span className="text-[10px] text-slate-400 font-semibold px-2 uppercase hidden xl:inline">Photo:</span>
              <button
                type="button"
                onClick={() => onChangePhotoAlignment('left')}
                className={`px-2.5 py-1 font-semibold rounded-lg transition-colors ${
                  photoAlignment === 'left'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Align photo to Left"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => onChangePhotoAlignment('center')}
                className={`px-2.5 py-1 font-semibold rounded-lg transition-colors ${
                  photoAlignment === 'center'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Align photo to Center"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => onChangePhotoAlignment('right')}
                className={`px-2.5 py-1 font-semibold rounded-lg transition-colors ${
                  photoAlignment === 'right'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Align photo to Right"
              >
                Right
              </button>
            </div>
          )}
        </div>

        {/* Right: Zoom & Single Authoritative Export Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700/80 p-1 text-slate-300">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitPage}
              className="p-1 hover:text-white transition-colors border-l border-slate-700 ml-0.5 pl-1.5"
              title="Fit to Container"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {onDownloadDoc && (
            <button
              onClick={() => onDownloadDoc('docx')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-200 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/80 rounded-xl transition-colors shadow-sm"
              title="Download editable Word document (.docx)"
            >
              <FileType className="w-3.5 h-3.5 text-sky-400" />
              <span>Word (.docx)</span>
            </button>
          )}

          <button
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start custom-scrollbar bg-slate-950"
      >
        <div
          id="resume-print-wrapper"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="transition-transform duration-100 ease-out origin-top flex flex-col items-center"
        >
          <div id="resume-print-canvas" className="flex flex-col items-center">
            {renderActiveResumeSheets()}
          </div>
        </div>
      </div>
    </div>
  );
};
