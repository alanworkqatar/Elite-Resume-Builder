import React from 'react';
import { JobDescriptionData } from '../../types/copilot';
import {
  Briefcase,
  Building,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  Compass,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface RoleIntelligenceViewProps {
  job: JobDescriptionData;
  onEditJob?: () => void;
}

export function RoleIntelligenceView({ job, onEditJob }: RoleIntelligenceViewProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header Banner */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            Role Intelligence Analysis
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{job.jobTitle || 'Target Opportunity'}</span>
            <span className="text-slate-500 font-normal">at</span>
            <span className="text-cyan-200">{job.company || 'Target Organization'}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            {job.seniority && (
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                {job.seniority}
              </span>
            )}
            {job.department && (
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                {job.location}
              </span>
            )}
          </div>
        </div>

        {onEditJob && (
          <button
            type="button"
            onClick={onEditJob}
            className="text-xs text-slate-400 hover:text-cyan-400 font-medium underline cursor-pointer"
          >
            Change Job
          </button>
        )}
      </div>

      {/* Role Summary / What Success Looks Like */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Understanding What Success Looks Like</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {job.summary || 'Strategic role focused on driving project deliverables, stakeholder coordination, and measurable business value.'}
        </p>
      </div>

      {/* Grid: Mandatory vs Preferred Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mandatory Capabilities */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mandatory Core Skills</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {job.mandatorySkills && job.mandatorySkills.length > 0 ? (
              job.mandatorySkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">None explicitly parsed</span>
            )}
          </div>
        </div>

        {/* Preferred / Nice-to-Have */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preferred & Complementary Skills</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {job.preferredSkills && job.preferredSkills.length > 0 ? (
              job.preferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-700/60 text-slate-300 font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">None explicitly parsed</span>
            )}
          </div>
        </div>
      </div>

      {/* Core Responsibilities */}
      {job.coreResponsibilities && job.coreResponsibilities.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Priority Responsibilities
          </h4>
          <ul className="space-y-1.5">
            {job.coreResponsibilities.map((resp, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Implicit Priorities (Clearly Disclosed as AI-Inferred) */}
      {job.implicitPriorities && job.implicitPriorities.length > 0 && (
        <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
              Contextual Inferred Priorities
            </h4>
            <span className="text-[10px] text-indigo-400 font-normal">
              (Inferred by AI from repetitive themes; not explicit requirements)
            </span>
          </div>
          <ul className="space-y-1">
            {job.implicitPriorities.map((item, idx) => (
              <li key={idx} className="text-xs text-indigo-200/90 flex items-start gap-1.5">
                <span className="text-indigo-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
