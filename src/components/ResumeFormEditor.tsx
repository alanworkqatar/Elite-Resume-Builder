import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Globe,
  Clock,
  Layers,
  Wand2,
  Check,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarClock
} from 'lucide-react';
import { ResumeData, WorkExperience, Education, SkillItem, AwardItem } from '../types/resume';
import { sortExperiencesChronologically } from '../utils/dateSorter';

interface ResumeFormEditorProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenUploadModal: () => void;
  onLoadSample?: () => void;
}

export const ResumeFormEditor: React.FC<ResumeFormEditorProps> = ({
  data,
  onChange,
  onOpenUploadModal,
  onLoadSample,
}) => {
  const isResumeEmpty =
    !data.personal?.fullName?.trim() &&
    (!data.experience || data.experience.length === 0) &&
    !data.summary?.trim();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    skills: false,
    awards: false,
  });

  const [enhancingSummary, setEnhancingSummary] = useState(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Personal field updates
  const handlePersonalChange = (field: keyof typeof data.personal, value: string) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  };

  // Photo file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handlePersonalChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    handlePersonalChange('photoUrl', '');
  };

  // Enhance summary with AI
  const handleEnhanceSummary = async () => {
    if (!data.summary.trim()) return;
    try {
      setEnhancingSummary(true);
      const res = await fetch('/api/enhance-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSummary: data.summary,
          headline: data.personal.headline,
        }),
      });
      const result = await res.json();
      if (result.enhancedText) {
        onChange({ ...data, summary: result.enhancedText });
      }
    } catch (err) {
      console.error('Enhance summary failed:', err);
    } finally {
      setEnhancingSummary(false);
    }
  };

  // Work experience handlers
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      location: '',
      duration: '',
      highlights: [''],
      achievements: [''],
    };
    onChange({
      ...data,
      experience: [newExp, ...data.experience],
    });
    setOpenSections((prev) => ({ ...prev, experience: true }));
  };

  const handleUpdateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((exp) => exp.id !== id),
    });
  };

  const handleSortExperiences = (order: 'reverse' | 'forward' = 'reverse') => {
    const sorted = sortExperiencesChronologically(data.experience, order);
    onChange({
      ...data,
      experience: sorted,
    });
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.experience.length) return;
    const newExps = [...data.experience];
    const [moved] = newExps.splice(index, 1);
    newExps.splice(targetIndex, 0, moved);
    onChange({
      ...data,
      experience: newExps,
    });
  };

  const handleAddHighlight = (expId: string) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) =>
        exp.id === expId ? { ...exp, highlights: [...exp.highlights, ''] } : exp
      ),
    });
  };

  const handleUpdateHighlight = (expId: string, index: number, value: string) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newHighlights = [...exp.highlights];
        newHighlights[index] = value;
        return { ...exp, highlights: newHighlights };
      }),
    });
  };

  const handleDeleteHighlight = (expId: string, index: number) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          highlights: exp.highlights.filter((_, i) => i !== index),
        };
      }),
    });
  };

  const handleAddAchievement = (expId: string) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) =>
        exp.id === expId ? { ...exp, achievements: [...exp.achievements, ''] } : exp
      ),
    });
  };

  const handleUpdateAchievement = (expId: string, index: number, value: string) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newAchievements = [...exp.achievements];
        newAchievements[index] = value;
        return { ...exp, achievements: newAchievements };
      }),
    });
  };

  const handleDeleteAchievement = (expId: string, index: number) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          achievements: exp.achievements.filter((_, i) => i !== index),
        };
      }),
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: '',
      degree: '',
      duration: '',
    };
    onChange({
      ...data,
      education: [...data.education, newEdu],
    });
    setOpenSections((prev) => ({ ...prev, education: true }));
  };

  const handleUpdateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  // Skills handlers
  const handleAddSkill = () => {
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name: '',
      rating: 4,
    };
    onChange({
      ...data,
      skills: [...data.skills, newSkill],
    });
    setOpenSections((prev) => ({ ...prev, skills: true }));
  };

  const handleUpdateSkill = (id: string, field: keyof SkillItem, value: any) => {
    onChange({
      ...data,
      skills: data.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };

  const handleDeleteSkill = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((s) => s.id !== id),
    });
  };

  // Awards handlers
  const handleAddAward = () => {
    const newAward: AwardItem = {
      id: `aw-${Date.now()}`,
      title: '',
      years: '',
    };
    onChange({
      ...data,
      awards: [...data.awards, newAward],
    });
    setOpenSections((prev) => ({ ...prev, awards: true }));
  };

  const handleUpdateAward = (id: string, field: keyof AwardItem, value: string) => {
    onChange({
      ...data,
      awards: data.awards.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    });
  };

  const handleDeleteAward = (id: string) => {
    onChange({
      ...data,
      awards: data.awards.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wide text-white">
            Master Resume Profile
          </h2>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ({data.experience?.length || 0} roles, {data.skills?.length || 0} skills)
          </span>
        </div>
        {!isResumeEmpty && (
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            title="Import or re-upload a resume file"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Re-upload File</span>
          </button>
        )}
      </div>

      {/* Accordion Form Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
        {/* Empty State Banner */}
        {isResumeEmpty && (
          <div className="p-4 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-sky-950/60 border border-cyan-500/40 rounded-xl space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Empty Resume Canvas
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full">
                Ready for Upload
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your resume builder is currently blank. Upload your existing resume (PDF, Word DOCX/DOC, or TXT) to automatically extract, format, and fill all sections, or start entering details below.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Resume File</span>
              </button>
              {onLoadSample && (
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Load Demo Sample</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 1. Header & Personal Profile */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                1. Photo, Identity & Contact Details
              </span>
            </div>
            {openSections.personal ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.personal && (
            <div className="p-4 space-y-4 border-t border-slate-800/60 bg-slate-950/20">
              {/* Photo Upload & Formatting Row */}
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Square Photo Preview Frame */}
                  <div
                    className={`w-20 h-20 aspect-square shrink-0 ${
                      data.personal.photoShape === 'circle'
                        ? 'rounded-full'
                        : data.personal.photoShape === 'rounded'
                        ? 'rounded-2xl'
                        : 'rounded-xl'
                    } border-2 border-cyan-400/50 overflow-hidden bg-slate-950 flex items-center justify-center relative shadow-md`}
                  >
                    {data.personal.photoUrl ? (
                      <img
                        src={data.personal.photoUrl}
                        alt="Profile Preview"
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
                      <ImageIcon className="w-7 h-7 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        Profile Photo (Square Format)
                      </span>
                      {data.personal.photoUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Square framing prevents image stretching and keeps your facial proportions natural.
                    </p>
                    <div className="pt-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-xs font-semibold rounded-lg transition-colors">
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Upload New Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Photo Formatting Controls (Shape, Fit, Alignment) */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {/* Photo Placement / Alignment */}
                  <div>
                    <label className="text-[10.5px] font-semibold text-cyan-300 uppercase tracking-wider block mb-1">
                      Photo Placement
                    </label>
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoAlignment', 'left')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors ${
                          !data.personal.photoAlignment || data.personal.photoAlignment === 'left'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Align photo to Left (default)"
                      >
                        <AlignLeft className="w-3 h-3" />
                        <span>Left</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoAlignment', 'center')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors ${
                          data.personal.photoAlignment === 'center'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Align photo to Center (Middle)"
                      >
                        <AlignCenter className="w-3 h-3" />
                        <span>Center</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoAlignment', 'right')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors ${
                          data.personal.photoAlignment === 'right'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Align photo to Right"
                      >
                        <AlignRight className="w-3 h-3" />
                        <span>Right</span>
                      </button>
                    </div>
                  </div>
                  {/* Shape Selector */}
                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Frame Shape
                    </label>
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoShape', 'square')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded transition-colors ${
                          !data.personal.photoShape || data.personal.photoShape === 'square'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Square
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoShape', 'rounded')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded transition-colors ${
                          data.personal.photoShape === 'rounded'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Soft
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoShape', 'circle')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded transition-colors ${
                          data.personal.photoShape === 'circle'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Circle
                      </button>
                    </div>
                  </div>

                  {/* Fit Mode */}
                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Image Fit
                    </label>
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoFit', 'cover')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded transition-colors ${
                          !data.personal.photoFit || data.personal.photoFit === 'cover'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Fill Frame
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoFit', 'contain')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded transition-colors ${
                          data.personal.photoFit === 'contain'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Full Photo
                      </button>
                    </div>
                  </div>

                  {/* Focus Alignment */}
                  <div>
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Focus Position
                    </label>
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoPosition', 'top')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded transition-colors ${
                          !data.personal.photoPosition || data.personal.photoPosition === 'top'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Top (Face)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePersonalChange('photoPosition', 'center')}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded transition-colors ${
                          data.personal.photoPosition === 'center'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Center
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Headline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={data.personal.fullName ?? ''}
                    onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Job Title / Headline
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={data.personal.headline ?? ''}
                    onChange={(e) => handlePersonalChange('headline', e.target.value)}
                    placeholder="e.g. Senior Operations Manager"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Contact: Location, Email, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={data.personal.location ?? ''}
                    onChange={(e) => handlePersonalChange('location', e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    value={data.personal.email ?? ''}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    placeholder="e.g. candidate@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={data.personal.phone ?? ''}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                    placeholder="e.g. +1 (555) 012-3456"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Regional Fields: Passport, Nationality, Visa Status, Availability */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={data.personal.passportNo ?? ''}
                    onChange={(e) => handlePersonalChange('passportNo', e.target.value)}
                    placeholder="e.g. L8924108"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Nationality / Visa
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={data.personal.nationality ?? ''}
                    onChange={(e) => handlePersonalChange('nationality', e.target.value)}
                    placeholder="e.g. Indian (Transferable Visa)"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Availability Banner
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={data.personal.availability ?? ''}
                    onChange={(e) => handlePersonalChange('availability', e.target.value)}
                    placeholder="CAN JOIN IMMEDIATELY"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold text-cyan-300 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Professional Summary */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                2. Professional Summary
              </span>
            </div>
            {openSections.summary ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.summary && (
            <div className="p-4 space-y-3 border-t border-slate-800/60 bg-slate-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Write or paste your career summary paragraph:
                </span>
                <button
                  type="button"
                  onClick={handleEnhanceSummary}
                  disabled={enhancingSummary || !data.summary.trim()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 rounded text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  {enhancingSummary ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-300" />
                      <span>Polishing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3 text-cyan-400" />
                      <span>AI Polish Summary</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={4}
                autoComplete="off"
                value={data.summary ?? ''}
                onChange={(e) => onChange({ ...data, summary: e.target.value })}
                placeholder="10+ years of experience in IT Product Management and Digital marketing in Digital Software products (B2B and B2C)..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 leading-relaxed placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* 3. Work Experience */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
            <button
              onClick={() => toggleSection('experience')}
              className="flex items-center gap-2.5 text-left"
            >
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                3. Work Experience ({data.experience.length})
              </span>
            </button>
            <div className="flex items-center gap-2">
              {data.experience.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleSortExperiences('reverse')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-sky-950/70 hover:bg-sky-900 text-sky-300 text-xs font-medium rounded-lg border border-sky-800/80 transition-colors"
                  title="Auto-sort jobs in reverse chronological order (most recent first)"
                >
                  <ArrowUpDown className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">Sort Chronology</span>
                  <span className="sm:hidden">Sort</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Job</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSection('experience')}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                {openSections.experience ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.experience && (
            <div className="p-4 space-y-5 border-t border-slate-800/60 bg-slate-950/20">
              {data.experience.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No work experience added yet. Click &quot;Add Job&quot; or upload a resume to auto-populate.
                </div>
              ) : (
                data.experience.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                          Role #{expIdx + 1}
                        </span>
                        {exp.duration && (
                          <span className="text-[10.5px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                            {exp.duration}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveExperience(expIdx, 'up')}
                          disabled={expIdx === 0}
                          className="text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 p-1 rounded transition-colors"
                          title="Move Role Earlier (Up)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExperience(expIdx, 'down')}
                          disabled={expIdx === data.experience.length - 1}
                          className="text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:hover:text-slate-400 p-1 rounded transition-colors"
                          title="Move Role Later (Down)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors ml-1"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          autoComplete="off"
                          value={exp.jobTitle ?? ''}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'jobTitle', e.target.value)
                          }
                          placeholder="e.g. IT Manager"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          autoComplete="off"
                          value={exp.company ?? ''}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'company', e.target.value)
                          }
                          placeholder="e.g. Apex Global Technologies"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          autoComplete="off"
                          value={exp.location ?? ''}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'location', e.target.value)
                          }
                          placeholder="e.g. Qatar or India"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                          Duration (Month Year)
                        </label>
                        <input
                          type="text"
                          autoComplete="off"
                          value={exp.duration ?? ''}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'duration', e.target.value)
                          }
                          placeholder="e.g. Sep 2019 - Dec 2020"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Highlights / Responsibilities */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                          Key Responsibilities (Bullets)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddHighlight(exp.id)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      <div className="space-y-2">
                        {exp.highlights.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2.5">
                            <span className="text-slate-500 text-sm">•</span>
                            <input
                              type="text"
                              autoComplete="off"
                              value={bullet ?? ''}
                              onChange={(e) =>
                                handleUpdateHighlight(exp.id, bIdx, e.target.value)
                              }
                              placeholder="Create IT Technology roadmap..."
                              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteHighlight(exp.id, bIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                              title="Delete bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Distinct Achievements */}
                    <div className="pt-2.5 border-t border-slate-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                          Key Achievements (Hyphenated)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddAchievement(exp.id)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          + Add Achievement
                        </button>
                      </div>
                      <div className="space-y-2">
                        {exp.achievements.map((ach, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-2.5">
                            <span className="text-cyan-400 text-sm font-bold">-</span>
                            <input
                              type="text"
                              autoComplete="off"
                              value={ach ?? ''}
                              onChange={(e) =>
                                handleUpdateAchievement(exp.id, aIdx, e.target.value)
                              }
                              placeholder="Implemented ERP to streamline workflow..."
                              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteAchievement(exp.id, aIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                              title="Delete achievement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 4. Education Qualification */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
            <button
              onClick={() => toggleSection('education')}
              className="flex items-center gap-2.5 text-left"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                4. Education Qualification ({data.education.length})
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddEducation}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add School</span>
              </button>
              <button
                onClick={() => toggleSection('education')}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                {openSections.education ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.education && (
            <div className="p-4 space-y-3 border-t border-slate-800/60 bg-slate-950/20">
              {data.education.length === 0 ? (
                <div className="text-center py-5 text-slate-500 text-xs">
                  No education added yet. Click &quot;Add School&quot; or upload a resume to auto-populate.
                </div>
              ) : (
                data.education.map((edu, eduIdx) => (
                <div
                  key={edu.id}
                  className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      School / College #{eduIdx + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-[11px] font-semibold text-slate-300 uppercase block mb-1.5">
                        Institution / College
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={edu.school ?? ''}
                        onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                        placeholder="e.g. St Francis Engineering College"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[11px] font-semibold text-slate-300 uppercase block mb-1.5">
                        Degree / Qualification
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={edu.degree ?? ''}
                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="Bachelor of Computer Engineering"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[11px] font-semibold text-slate-300 uppercase block mb-1.5">
                        Duration
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={edu.duration ?? ''}
                        onChange={(e) => handleUpdateEducation(edu.id, 'duration', e.target.value)}
                        placeholder="Jun 2002- Jun 2007"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          )}
        </div>

        {/* 5. Skills Summary (with 1-5 dot rating) */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
            <button
              onClick={() => toggleSection('skills')}
              className="flex items-center gap-2.5 text-left"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                5. Skills Summary ({data.skills.length})
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSkill}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Skill</span>
              </button>
              <button
                onClick={() => toggleSection('skills')}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                {openSections.skills ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.skills && (
            <div className="p-4 space-y-2.5 border-t border-slate-800/60 bg-slate-950/20">
              {data.skills.length === 0 ? (
                <div className="text-center py-5 text-slate-500 text-xs">
                  No skills added yet. Click &quot;Add Skill&quot; or upload a resume to auto-populate.
                </div>
              ) : (
                <>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Click on the dots to set the rating (1 to 5 dots displayed on the resume):
                  </span>
                  <div className="space-y-2">
                    {data.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center gap-3 p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl"
                      >
                        <input
                          type="text"
                          autoComplete="off"
                          value={skill.name ?? ''}
                          onChange={(e) => handleUpdateSkill(skill.id, 'name', e.target.value)}
                          placeholder="e.g. Project Management"
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />

                        {/* Clickable Dot Rating */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <button
                              key={dot}
                              type="button"
                              onClick={() => handleUpdateSkill(skill.id, 'rating', dot)}
                              className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                                dot <= skill.rating
                                  ? 'bg-cyan-400 scale-105'
                                  : 'bg-slate-700 hover:bg-slate-600'
                              }`}
                              title={`Rate ${dot} of 5`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 6. Awards / Certificates */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden transition-all">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
            <button
              onClick={() => toggleSection('awards')}
              className="flex items-center gap-2.5 text-left"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                6. Awards / Certificates ({data.awards.length})
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddAward}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Award / Certificate</span>
              </button>
              <button
                onClick={() => toggleSection('awards')}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                {openSections.awards ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.awards && (
            <div className="p-4 space-y-2 border-t border-slate-800/60 bg-slate-950/20">
              {data.awards.length === 0 ? (
                <div className="text-center py-5 text-slate-500 text-xs">
                  No awards added yet. Click &quot;Add Award / Certificate&quot; or upload a resume to auto-populate.
                </div>
              ) : (
                data.awards.map((award) => (
                  <div
                    key={award.id}
                    className="flex items-center gap-2.5 p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl"
                  >
                    <input
                      type="text"
                      autoComplete="off"
                      value={award.title ?? ''}
                      onChange={(e) => handleUpdateAward(award.id, 'title', e.target.value)}
                      placeholder="Award / Certificate Title, e.g. PMP, Ascent Matcher award"
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <input
                      type="text"
                      autoComplete="off"
                      value={award.years ?? ''}
                      onChange={(e) => handleUpdateAward(award.id, 'years', e.target.value)}
                      placeholder="(2011-2012)"
                      className="w-32 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      onClick={() => handleDeleteAward(award.id)}
                      className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
