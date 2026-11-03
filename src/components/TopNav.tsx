import React, { useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  FileDown,
  FileUp,
  LayoutTemplate,
  FileType,
  ShieldCheck,
  ChevronDown,
  Briefcase,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { TemplateStyle } from '../types/resume';
import { RESUME_TEMPLATES } from '../data/templates';

export type MainNavView = 'master_editor' | 'copilot_workspace' | 'applications_manager';

interface TopNavProps {
  currentView: MainNavView;
  onChangeView: (view: MainNavView) => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onDownloadPdf: () => void;
  onDownloadDoc?: (format?: 'doc' | 'docx') => void;
  onPrintVector: () => void;
  isDownloadingPdf?: boolean;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  templateStyle: TemplateStyle;
  onOpenTemplateSelector: () => void;
  onOpenAtsOptimizer?: () => void;
  onTailorForJob: () => void;
  applicationsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onChangeView,
  onOpenUpload,
  onLoadSample,
  onReset,
  onDownloadPdf,
  onDownloadDoc,
  onPrintVector,
  isDownloadingPdf = false,
  onExportJson,
  onImportJson,
  templateStyle,
  onOpenTemplateSelector,
  onOpenAtsOptimizer,
  onTailorForJob,
  applicationsCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTemplate =
    RESUME_TEMPLATES.find((t) => t.id === templateStyle) || RESUME_TEMPLATES[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportJson(e.target.files[0]);
    }
  };

  return (
    <header className="flex flex-col border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 no-print">
      {/* Primary Top Bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-950 font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white whitespace-nowrap">
              Elite Resume Builder
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
              AI Job Application Copilot
            </span>
          </div>
        </div>

        {/* View Switcher Tabs (Desktop) */}
        <div className="hidden md:flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onChangeView('master_editor')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'master_editor'
                ? 'bg-slate-800 text-cyan-300 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('copilot_workspace')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'copilot_workspace'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Job Copilot</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('applications_manager')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'applications_manager'
                ? 'bg-slate-800 text-cyan-300 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Applications ({applicationsCount})</span>
          </button>
        </div>

        {/* Primary CTA: + TAILOR RESUME FOR A JOB */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onTailorForJob}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-950 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 font-bold" />
            <span>+ Tailor Resume for a Job</span>
          </button>

        </div>
      </div>

      {/* Secondary Utility Row (Templates, ATS, Upload, Sample, Reset) */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-1.5 bg-slate-950 border-t border-slate-900 text-xs overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile view buttons */}
          <div className="flex md:hidden bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => onChangeView('master_editor')}
              className={`px-2 py-1 rounded font-bold ${currentView === 'master_editor' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Master
            </button>
            <button
              onClick={() => onChangeView('copilot_workspace')}
              className={`px-2 py-1 rounded font-bold ${currentView === 'copilot_workspace' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Copilot
            </button>
            <button
              onClick={() => onChangeView('applications_manager')}
              className={`px-2 py-1 rounded font-bold ${currentView === 'applications_manager' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Apps ({applicationsCount})
            </button>
          </div>

          {/* Template Selector Trigger */}
          <button
            onClick={onOpenTemplateSelector}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-lg transition-all text-xs shrink-0"
          >
            <LayoutTemplate className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold">{activeTemplate.name}</span>
            <span className="px-1 text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono">
              {activeTemplate.atsScore}% ATS
            </span>
          </button>

          {/* ATS Scanner Button */}
          {onOpenAtsOptimizer && (
            <button
              onClick={onOpenAtsOptimizer}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 rounded-lg transition-colors text-xs shrink-0"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>ATS Scanner</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors text-xs shrink-0"
          >
            <Upload className="w-3 h-3 text-cyan-400" />
            <span>Upload Resume</span>
          </button>

          <button
            onClick={onLoadSample}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors text-xs shrink-0"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Demo Sample</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-slate-400 text-xs">
          <button
            onClick={onPrintVector}
            className="hover:text-white transition-colors"
            title="Browser Vector Print"
          >
            Print
          </button>
          <span>•</span>
          <button
            onClick={onExportJson}
            className="hover:text-white transition-colors"
            title="Save JSON backup"
          >
            JSON
          </button>
          <span>•</span>
          <label className="hover:text-white transition-colors cursor-pointer">
            Import
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span>•</span>
          <button
            onClick={onReset}
            className="hover:text-rose-400 transition-colors"
            title="Clear resume"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};
