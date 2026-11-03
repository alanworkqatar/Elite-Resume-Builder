import React from 'react';
import { PositioningStrategy } from '../../types/copilot';
import { Target, ArrowUpRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CandidatePositioningCardProps {
  strategy: PositioningStrategy;
}

export function CandidatePositioningCard({ strategy }: CandidatePositioningCardProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Strategic Candidate Positioning
            </h3>
            <p className="text-[11px] text-slate-400">
              Alignment rationale connecting verified background to employer expectations.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Factual Positioning
        </span>
      </div>

      {/* Recommended Headline */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Recommended Professional Headline
        </span>
        <p className="text-sm font-bold text-cyan-300">
          {strategy.recommendedHeadline}
        </p>
      </div>

      {/* Strategic Angle & Narrative */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Strategic Career Narrative
        </span>
        <p className="text-xs text-slate-300 leading-relaxed">
          {strategy.positioningAngle}
        </p>
      </div>

      {/* Priority Experiences & Emphasized Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            Roles to Emphasize in Detail
          </span>
          <div className="space-y-1">
            {strategy.priorityExperiences && strategy.priorityExperiences.length > 0 ? (
              strategy.priorityExperiences.map((exp, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{exp}</span>
                </div>
              ))
            ) : (
              <span className="text-slate-500">All current experiences retain proportional depth</span>
            )}
          </div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Core Competencies Ranked Top
          </span>
          <div className="flex flex-wrap gap-1">
            {strategy.emphasizedSkills && strategy.emphasizedSkills.length > 0 ? (
              strategy.emphasizedSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-700 text-slate-200 font-medium"
                >
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-slate-500">Preserved master ordering</span>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Rationale */}
      {strategy.strategicRationale && (
        <div className="text-[11px] text-slate-400 italic bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60">
          <strong>Strategic Rationale:</strong> "{strategy.strategicRationale}"
        </div>
      )}
    </div>
  );
}
