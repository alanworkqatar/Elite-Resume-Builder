import React, { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck2,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Cpu,
  Building2,
  Crown
} from 'lucide-react';
import { TemplateStyle } from '../types/resume';
import { RESUME_TEMPLATES, TemplateDefinition } from '../data/templates';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: TemplateStyle;
  onSelectTemplate: (template: TemplateStyle) => void;
  atsScore?: number;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTemplate,
  onSelectTemplate,
  atsScore = 98,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ats' | 'executive'>('all');

  if (!isOpen) return null;

  const filteredTemplates = RESUME_TEMPLATES.filter((tpl) => {
    if (activeTab === 'ats') return tpl.category === 'ATS Single-Column';
    if (activeTab === 'executive') return tpl.category === 'Executive Multi-Column';
    return true;
  });

  const getTemplateIcon = (id: TemplateStyle) => {
    switch (id) {
      case 'ats-corporate-clean':
        return <Building2 className="w-5 h-5 text-indigo-400" />;
      case 'ats-modern-accent':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'ats-executive-hybrid':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'ats-single-column':
        return <FileCheck2 className="w-5 h-5 text-emerald-400" />;
      case 'executive-two-column':
      default:
        return <Briefcase className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-950/50">
              <Layers className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Choose Resume Format
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ATS Certified (98-100%)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select from 5 specialized formats optimized for automated ATS parsers and executive recruiters.
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

        {/* Tab Filters */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Formats (5)
            </button>
            <button
              onClick={() => setActiveTab('ats')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'ats'
                  ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% ATS Single-Col (4)</span>
            </button>
            <button
              onClick={() => setActiveTab('executive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'executive'
                  ? 'bg-sky-950/80 text-sky-200 border border-sky-700/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              <span>Executive 2-Column (1)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Format switches apply instantly to Word (.doc/.docx) & PDF</span>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template.id);
                  }}
                  className={`group relative p-5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {/* Top Row: Icon + Name + Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        {getTemplateIcon(template.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                            {template.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {template.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          template.atsScore >= 98
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                        }`}
                      >
                        ATS {template.atsScore}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {template.badge}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Best For Tag */}
                  <div className="mb-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-semibold">Best for: </span>
                    <span className="text-slate-200">{template.bestFor}</span>
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3 text-[10.5px] text-slate-400">
                    {template.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Selection Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10.5px] text-slate-400 font-mono">
                      Category: {template.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template.id);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Format</span>
                        </>
                      ) : (
                        <>
                          <span>Apply Format</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              All 5 formats maintain strict 10.5pt font size, multi-page pagination, and comfortable padding.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
