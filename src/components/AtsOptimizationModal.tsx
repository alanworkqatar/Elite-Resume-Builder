import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Search,
  Hash,
  Activity,
  FileCheck2,
  Building,
  Target
} from 'lucide-react';
import { ResumeData, TemplateStyle } from '../types/resume';
import { analyzeResumeForAts, AtsAnalysis } from '../utils/atsAnalyzer';
import { RESUME_TEMPLATES } from '../data/templates';

interface AtsOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  templateStyle: TemplateStyle;
  onSelectTemplate?: (template: TemplateStyle) => void;
}

export const AtsOptimizationModal: React.FC<AtsOptimizationModalProps> = ({
  isOpen,
  onClose,
  data,
  templateStyle,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const analysis: AtsAnalysis = analyzeResumeForAts(data);
  const currentTemplate = RESUME_TEMPLATES.find((t) => t.id === templateStyle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-6 h-6 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  ATS Scanner & Optimization Engine
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  Workday • Taleo • Greenhouse Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live audit of how corporate Applicant Tracking Systems parse and rank your resume.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-emerald-400">
              {analysis.score}%
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">ATS Match Score</div>
            <div className="text-[9.5px] text-emerald-300 font-semibold mt-0.5">
              Grade {analysis.grade}
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-cyan-400">
              {analysis.detectedMetricsCount}
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">Quantified Metrics</div>
            <div className="text-[9.5px] text-cyan-300 font-semibold mt-0.5">%, $, Numbers</div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-sky-400">
              {analysis.detectedActionVerbsCount}
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">Action Power Verbs</div>
            <div className="text-[9.5px] text-sky-300 font-semibold mt-0.5">Led, Managed, Scaled</div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-indigo-400">
              {analysis.skillsCount}
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">Indexed Skills</div>
            <div className="text-[9.5px] text-indigo-300 font-semibold mt-0.5">Target Keywords</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 max-h-[55vh] custom-scrollbar">
          {/* Active Template Status */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-700/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileCheck2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white">
                  Active Layout: {currentTemplate?.name}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {currentTemplate?.tagline} • ATS Compatibility: {currentTemplate?.atsScore}%
                </p>
              </div>
            </div>
            {onSelectTemplate && (
              <button
                onClick={() => {
                  onSelectTemplate('ats-corporate-clean');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Switch to Corporate Clean
              </button>
            )}
          </div>

          {/* Audit Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>ATS Parser Checklist</span>
            </h3>
            <div className="space-y-2.5">
              {analysis.checks.map((check) => (
                <div
                  key={check.id}
                  className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    {check.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : check.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{check.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {check.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-xs font-mono font-bold ${
                        check.points === check.maxPoints
                          ? 'text-emerald-400'
                          : check.points > 0
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {check.points}/{check.maxPoints} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Actionable ATS Boosters</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How Parsers Read Your Resume */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/90 text-xs">
            <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>How Modern ATS Bots (Workday, Taleo, Greenhouse) Read Your Data</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When applying via corporate portals, ATS engines strip CSS styling and convert documents into clean linear text blocks. The single-column formats (Corporate Clean, Modern Tech Accent, and Executive Hybrid) guarantee that sections, job titles, employment dates, and skill keywords are extracted with 100% precision.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <span>Overall Score: {analysis.score}% (Grade {analysis.grade})</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-colors shadow-md shadow-emerald-950"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
