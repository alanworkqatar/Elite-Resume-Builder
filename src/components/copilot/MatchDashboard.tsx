import React, { useState } from 'react';
import {
  JobMatchAnalysis,
  RequirementMatchItem,
  MatchScoreWeights,
  MatchClassification,
} from '../../types/copilot';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface MatchDashboardProps {
  analysis: JobMatchAnalysis;
  onUpdateWeights?: (weights: MatchScoreWeights) => void;
  onGenerateTailored?: () => void;
  isGenerating?: boolean;
}

export function MatchDashboard({
  analysis,
  onUpdateWeights,
  onGenerateTailored,
  isGenerating,
}: MatchDashboardProps) {
  const [filterType, setFilterType] = useState<MatchClassification | 'all'>('all');
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [weights, setWeights] = useState<MatchScoreWeights>(
    analysis.weights || {
      experience: 30,
      skills: 25,
      responsibilities: 20,
      qualifications: 10,
      industry: 10,
      seniority: 5,
    }
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30';
    if (score >= 60) return 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30';
    if (score >= 40) return 'from-amber-500/20 to-orange-500/10 border-amber-500/30';
    return 'from-rose-500/20 to-red-500/10 border-rose-500/30';
  };

  const filteredRequirements = (analysis.requirements || []).filter((req) => {
    if (filterType === 'all') return true;
    return req.matchType === filterType;
  });

  const directCount = (analysis.requirements || []).filter((r) => r.matchType === 'direct_match').length;
  const transferableCount = (analysis.requirements || []).filter(
    (r) => r.matchType === 'transferable_match' || r.matchType === 'partial_match'
  ).length;
  const missingCount = (analysis.requirements || []).filter((r) => r.matchType === 'not_documented').length;
  const confirmCount = (analysis.requirements || []).filter(
    (r) => r.matchType === 'confirmation_required'
  ).length;

  const handleWeightChange = (key: keyof MatchScoreWeights, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    if (onUpdateWeights) onUpdateWeights(updated);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Top Alignment Score Overview */}
      <div className={`p-5 rounded-2xl border bg-gradient-to-br ${getScoreBg(analysis.overallAlignmentScore)} flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * analysis.overallAlignmentScore) / 100}
                className={getScoreColor(analysis.overallAlignmentScore)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-black font-mono tracking-tight ${getScoreColor(analysis.overallAlignmentScore)}`}>
                {analysis.overallAlignmentScore}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Match</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full inline-block mb-1">
              Documented Evidence Alignment
            </span>
            <h3 className="text-base font-bold text-white">Semantic Job Alignment Score</h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              Computed from verified master profile achievements vs. employer expectations.
            </p>
          </div>
        </div>

        {/* Generate CTA Button */}
        {onGenerateTailored && (
          <button
            type="button"
            onClick={onGenerateTailored}
            disabled={isGenerating}
            className="w-full md:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isGenerating ? 'Tailoring Documents...' : 'Generate Tailored Application'}</span>
          </button>
        )}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/50 border border-slate-800/80 rounded-xl text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          <strong>Factual Integrity Notice:</strong> This is an internal alignment estimate based on documented evidence, NOT a guaranteed ATS score or interview prediction.
        </span>
      </div>

      {/* 6 Category Breakdown & Configurable Weights */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Category Breakdown
          </h4>
          <button
            type="button"
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showWeightSliders ? 'Hide Weights' : 'Adjust Weights'}</span>
            {showWeightSliders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { key: 'experience', label: 'Experience', score: analysis.categoryScores?.experience || 80, weight: weights.experience },
            { key: 'skills', label: 'Skills', score: analysis.categoryScores?.skills || 75, weight: weights.skills },
            { key: 'responsibilities', label: 'Duties', score: analysis.categoryScores?.responsibilities || 80, weight: weights.responsibilities },
            { key: 'qualifications', label: 'Degrees', score: analysis.categoryScores?.qualifications || 85, weight: weights.qualifications },
            { key: 'industry', label: 'Industry', score: analysis.categoryScores?.industry || 75, weight: weights.industry },
            { key: 'seniority', label: 'Seniority', score: analysis.categoryScores?.seniority || 85, weight: weights.seniority },
          ].map((cat) => (
            <div key={cat.key} className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold truncate">
                {cat.label} ({cat.weight}%)
              </span>
              <span className={`text-sm font-bold font-mono ${getScoreColor(cat.score)}`}>
                {cat.score}%
              </span>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Weight Adjuster */}
        {showWeightSliders && (
          <div className="mt-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 animate-fade-in">
            <span className="text-xs text-slate-400 font-medium block">
              Adjust category weighting percentage (total must equal 100%):
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(weights) as (keyof MatchScoreWeights)[]).map((k) => (
                <div key={k} className="flex items-center justify-between text-xs text-slate-300">
                  <span className="capitalize">{k}:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights[k]}
                    onChange={(e) => handleWeightChange(k, parseInt(e.target.value) || 0)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-mono text-cyan-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs for Requirements */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Evidence Mapping ({analysis.requirements?.length || 0})
          </h4>

          <div className="flex flex-wrap gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({analysis.requirements?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('direct_match')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'direct_match' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct ({directCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('transferable_match')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'transferable_match' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Transferable ({transferableCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('not_documented')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'not_documented' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Missing ({missingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('confirmation_required')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'confirmation_required' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirm ({confirmCount})
            </button>
          </div>
        </div>

        {/* Requirements Table */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredRequirements.length > 0 ? (
            filteredRequirements.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row items-start justify-between gap-3 text-xs"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {req.matchType === 'direct_match' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Direct Match
                      </span>
                    )}
                    {req.matchType === 'transferable_match' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Transferable Match
                      </span>
                    )}
                    {req.matchType === 'not_documented' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Not Documented
                      </span>
                    )}
                    {req.matchType === 'confirmation_required' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <HelpCircle className="w-3 h-3" /> User Confirmation Required
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {req.category}
                    </span>
                  </div>

                  <p className="font-semibold text-white">{req.requirement}</p>

                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong className="text-slate-300">Candidate Evidence: </strong>
                    {req.candidateEvidence}
                  </p>

                  {req.sourceRole && (
                    <span className="text-[10px] text-cyan-300/80 font-mono block">
                      Source: {req.sourceRole}
                    </span>
                  )}
                </div>

                <div className="w-full md:w-48 bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-400 shrink-0">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                    Suggested Treatment
                  </span>
                  <span>{req.suggestedResumeTreatment}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">
              No requirements match this filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
