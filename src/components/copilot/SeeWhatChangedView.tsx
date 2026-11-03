import React from 'react';
import { DiffChangeItem } from '../../types/copilot';
import {
  GitCompare,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface SeeWhatChangedViewProps {
  diffChanges: DiffChangeItem[];
  onToggleAcceptChange: (diffId: string) => void;
  onRestoreAllOriginals: () => void;
  onAcceptAllChanges: () => void;
}

export function SeeWhatChangedView({
  diffChanges,
  onToggleAcceptChange,
  onRestoreAllOriginals,
  onAcceptAllChanges,
}: SeeWhatChangedViewProps) {
  const acceptedCount = diffChanges.filter((d) => d.accepted).length;

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400';
      case 'rewritten':
        return 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400';
      case 'reordered':
        return 'bg-indigo-950/60 border-indigo-500/30 text-indigo-400';
      case 'shortened':
      case 'removed':
        return 'bg-amber-950/60 border-amber-500/30 text-amber-400';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <GitCompare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>See What AI Changed</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
                {acceptedCount} of {diffChanges.length} accepted
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every modification is transparently justified. Accept, reject, or restore original wording.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onAcceptAllChanges}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
          <button
            type="button"
            onClick={onRestoreAllOriginals}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Originals</span>
          </button>
        </div>
      </div>

      {/* Changes List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {diffChanges.length > 0 ? (
          diffChanges.map((diff) => (
            <div
              key={diff.id}
              className={`p-4 rounded-xl border transition-all ${
                diff.accepted
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-950/30 border-slate-800/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(
                      diff.changeType
                    )}`}
                  >
                    {diff.changeType}
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    {diff.section}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAcceptChange(diff.id)}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    diff.accepted
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{diff.accepted ? 'Accepted' : 'Rejected (Original Kept)'}</span>
                </button>
              </div>

              {/* Side-by-Side or Stacked Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                {/* Original Content */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Original Master Profile Text
                  </span>
                  <p className="text-slate-400 line-through leading-relaxed">
                    {diff.originalText || '(None)'}
                  </p>
                </div>

                {/* Tailored Version */}
                <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Tailored Alignment Version
                  </span>
                  <p className="text-slate-100 font-medium leading-relaxed">
                    {diff.tailoredText}
                  </p>
                </div>
              </div>

              {/* Why Was This Changed? Reason block */}
              <div className="flex items-start gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 text-xs text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-200">Why was this changed? </strong>
                  <span className="text-slate-300">{diff.reason}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            No changes recorded yet. Click "Generate Tailored Application" to see granular differences.
          </p>
        )}
      </div>
    </div>
  );
}
