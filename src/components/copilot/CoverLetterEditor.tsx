import React from 'react';
import { CoverLetterData } from '../../types/copilot';
import {
  FileText,
  Sparkles,
  Sliders,
  Type,
  Building,
  Briefcase,
  User,
  Calendar,
  RotateCcw,
} from 'lucide-react';

interface CoverLetterEditorProps {
  data: CoverLetterData;
  onChange: (updated: CoverLetterData) => void;
  onRegenerate: (tone: 'executive' | 'persuasive' | 'concise', length: 'short' | 'standard') => void;
  isRegenerating?: boolean;
}

export function CoverLetterEditor({
  data,
  onChange,
  onRegenerate,
  isRegenerating,
}: CoverLetterEditorProps) {
  // Word count helper
  const totalWords = [
    data.openingParagraph,
    data.relevanceParagraph,
    data.evidenceParagraph,
    data.employerFitParagraph,
    data.closingParagraph,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const updateField = (field: keyof CoverLetterData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Cover Letter Strategist & Editor</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            5-paragraph executive structure connecting proven achievements directly to employer goals.
          </p>
        </div>

        {/* Word Count Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300">
            {totalWords} words ({data.length === 'short' ? '150-180 target' : '250-300 target'})
          </span>
        </div>
      </div>

      {/* Style & Length Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
        {/* Tone Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Tone & Voice
          </label>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1">
            {[
              { id: 'executive', label: 'Executive' },
              { id: 'persuasive', label: 'Persuasive' },
              { id: 'concise', label: 'Concise' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onRegenerate(t.id as any, data.length)}
                className={`flex-1 py-1 px-2 rounded font-medium text-center transition-colors cursor-pointer ${
                  data.tone === t.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Length Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Length Target
          </label>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1">
            {[
              { id: 'standard', label: 'Standard (250-300w)' },
              { id: 'short', label: 'Short (150-180w)' },
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onRegenerate(data.tone, l.id as any)}
                className={`flex-1 py-1 px-2 rounded font-medium text-center transition-colors cursor-pointer ${
                  data.length === l.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipient & Role Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Recipient Name</label>
          <input
            type="text"
            autoComplete="off"
            value={data.recipientName || ''}
            onChange={(e) => updateField('recipientName', e.target.value)}
            placeholder="Hiring Manager"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Company Name</label>
          <input
            type="text"
            autoComplete="off"
            value={data.companyName || ''}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder="Target Organization"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Position Title</label>
          <input
            type="text"
            autoComplete="off"
            value={data.jobTitle || ''}
            onChange={(e) => updateField('jobTitle', e.target.value)}
            placeholder="Target Role"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Letter Date</label>
          <input
            type="text"
            autoComplete="off"
            value={data.date || ''}
            onChange={(e) => updateField('date', e.target.value)}
            placeholder="Date"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Refined 3-Pillar Banner Indicator */}
      <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-800/50 rounded-xl text-xs">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-slate-300">
          <strong className="text-white">Refined 3-Pillar Architecture:</strong> Structured around (1) Proven Achievements, (2) Role Alignment, and (3) Business Impact Delivery.
        </span>
      </div>

      {/* Paragraph 1: Opening */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Executive Opening & Position Thesis
          </label>
          <span className="text-[10px] text-slate-500 font-mono">Thesis</span>
        </div>
        <textarea
          autoComplete="off"
          value={data.openingParagraph || ''}
          onChange={(e) => updateField('openingParagraph', e.target.value)}
          rows={3}
          placeholder="I am writing to express my strong interest in the [Role] opportunity at [Company]..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans transition-colors"
        />
      </div>

      {/* Pillar 1: Relevant Experience, Expertise & Proven Achievements */}
      <div className="space-y-1.5 p-3.5 bg-slate-950/40 rounded-xl border border-cyan-900/30">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-mono text-[10px]">01</span>
            <span>My Relevant Experience, Expertise & Proven Achievements</span>
          </label>
        </div>
        <p className="text-[11px] text-slate-400">
          Highlight deep domain expertise and verified, quantified career achievements from your actual background.
        </p>
        <textarea
          autoComplete="off"
          value={data.relevanceParagraph || ''}
          onChange={(e) => updateField('relevanceParagraph', e.target.value)}
          rows={4}
          placeholder="Throughout my career, including my leadership tenure as [Title] at [Company], I have specialized in [Core Competency]. Notably, I [Quantified Metric Achievement 1] and [Quantified Metric Achievement 2]..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans transition-colors"
        />
      </div>

      {/* Pillar 2: Why I Am the Right Fit */}
      <div className="space-y-1.5 p-3.5 bg-slate-950/40 rounded-xl border border-sky-900/30">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-700/60 text-sky-300 font-mono text-[10px]">02</span>
            <span>Why I Am the Right Fit (Role Alignment)</span>
          </label>
        </div>
        <p className="text-[11px] text-slate-400">
          Explain how your background, technical competencies, and management acumen directly align with this specific role.
        </p>
        <textarea
          autoComplete="off"
          value={data.evidenceParagraph || ''}
          onChange={(e) => updateField('evidenceParagraph', e.target.value)}
          rows={4}
          placeholder="My background is specifically aligned with the strategic mandates of this role. Having directed [Domain Operations/Projects], I bring hands-on mastery in [Mandate 1] and [Mandate 2]..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans transition-colors"
        />
      </div>

      {/* Pillar 3: VALUE: What I Can Deliver */}
      <div className="space-y-1.5 p-3.5 bg-slate-950/40 rounded-xl border border-emerald-900/30">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono text-[10px]">03</span>
            <span>VALUE: What I Can Deliver (Business Impact)</span>
          </label>
        </div>
        <p className="text-[11px] text-slate-400">
          Detail the business impact and organizational ROI you will bring to the company (speed to value, efficiencies, revenue/cost impact).
        </p>
        <textarea
          autoComplete="off"
          value={data.employerFitParagraph || ''}
          onChange={(e) => updateField('employerFitParagraph', e.target.value)}
          rows={4}
          placeholder="From day one, my focus will be on accelerating organizational velocity and driving measurable business impact. I will establish [Deliverable 1], optimize [Deliverable 2], and ensure your initiatives deliver sustained ROI..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans transition-colors"
        />
      </div>

      {/* Paragraph 5: Closing & Call to Action */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Executive Closing & Discussion Proposal
          </label>
          <span className="text-[10px] text-slate-500 font-mono">Sign-off</span>
        </div>
        <textarea
          autoComplete="off"
          value={data.closingParagraph || ''}
          onChange={(e) => updateField('closingParagraph', e.target.value)}
          rows={2}
          placeholder="Thank you for your consideration. I welcome the opportunity to discuss how my verified background and execution focus can support [Company]'s success..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans transition-colors"
        />
      </div>

      {/* Quick Action: Regenerate */}
      <button
        type="button"
        onClick={() => onRegenerate(data.tone, data.length)}
        disabled={isRegenerating}
        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{isRegenerating ? 'Rewriting with 3-Pillar AI Model...' : 'Regenerate Refined 3-Pillar Cover Letter'}</span>
      </button>
    </div>
  );
}
