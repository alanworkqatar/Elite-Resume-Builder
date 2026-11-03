import React, { useState, useRef } from 'react';
import { JobDescriptionData, IngestionSourceType } from '../../types/copilot';
import { Upload, FileText, Sparkles, Building, Briefcase, AlertCircle, Loader2, Check } from 'lucide-react';

interface JobDescriptionInputProps {
  onParsed: (job: JobDescriptionData) => void;
  isLoading: boolean;
  initialData?: JobDescriptionData | null;
}

export function JobDescriptionInput({ onParsed, isLoading, initialData }: JobDescriptionInputProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [pastedText, setPastedText] = useState(initialData?.rawText || '');
  const [companyName, setCompanyName] = useState(initialData?.company || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setParsingError('File size must be under 10MB.');
        return;
      }
      setSelectedFile(file);
      setParsingError(null);
    }
  };

  const handleSubmit = async () => {
    setParsingError(null);
    setIsSubmitting(true);

    try {
      let payload: any = {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
      };

      if (activeTab === 'upload' && selectedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(selectedFile);
        const base64Data = await base64Promise;

        payload.base64Data = base64Data;
        payload.mimeType = selectedFile.type;
        payload.fileName = selectedFile.name;
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 25) {
          setParsingError('Please paste at least 2-3 sentences of the job description.');
          setIsSubmitting(false);
          return;
        }
        payload.rawText = pastedText.trim();
        payload.fileName = 'Job_Description.txt';
      }

      const res = await fetch('/api/parse-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze job description.');
      }

      onParsed(json.data);
    } catch (err: any) {
      console.error('Job parsing error:', err);
      setParsingError(err.message || 'Error parsing job description.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>Target Job Opportunity</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest the target vacancy via text or document to unlock semantic alignment.
          </p>
        </div>

        {/* Input Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'paste' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'upload' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
        </div>
      </div>

      {/* Optional Metadata Row (Auto-inferred if blank) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Target Job Title <span className="text-slate-500 font-normal">(Optional, AI auto-detects)</span>
          </label>
          <div className="relative">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              autoComplete="off"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Project Manager"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Target Company <span className="text-slate-500 font-normal">(Optional, AI auto-detects)</span>
          </label>
          <div className="relative">
            <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              autoComplete="off"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google / Microsoft / Enterprise"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Input Body */}
      {activeTab === 'paste' ? (
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Job Description Content
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={8}
            placeholder="Paste the full job posting here (including role overview, responsibilities, mandatory qualifications, and nice-to-haves)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
            <span>Minimum 25 characters for meaningful role analysis</span>
            <span>{pastedText.length} characters</span>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/50 rounded-2xl p-8 text-center cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              {selectedFile ? selectedFile.name : 'Click to select Job Description'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, Word (.docx) or Text files up to 10MB
            </p>
            {selectedFile && (
              <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px]">
                <Check className="w-3 h-3" /> Ready for AI analysis
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error alert */}
      {parsingError && (
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl mb-4">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{parsingError}</span>
        </div>
      )}

      {/* Analyze CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing Employer Requirements...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Analyze Role Intelligence & Requirements</span>
          </>
        )}
      </button>
    </div>
  );
}
