import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  FileCheck2,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
  ClipboardPaste,
  FileUp,
  RotateCw
} from 'lucide-react';
import { ResumeData } from '../types/resume';
import { normalizeResumeData } from '../utils/normalizeResume';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ResumeData) => void;
  onLoadSample: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onLoadSample,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setErrorMessage(null);
    setFile(selectedFile);
    // Automatically trigger processing immediately so user never has to guess
    processFile(selectedFile);
  };

  const sanitizeErrorMessage = (err: any): string => {
    const raw = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
    if (
      raw.includes('503') ||
      raw.includes('UNAVAILABLE') ||
      raw.includes('high demand') ||
      raw.includes('spikes in demand')
    ) {
      return 'The AI service experienced a momentary traffic spike. Click Retry below to extract again via our fallback engine.';
    }
    if (raw.includes('429') || raw.includes('exhausted')) {
      return 'AI service traffic limit reached. Please wait a moment and click Retry.';
    }
    // Clean JSON error messages
    const cleaned = raw.replace(/\{"error":.*?\}/g, '').trim();
    return cleaned.length > 5 ? cleaned : 'Unable to extract resume automatically. You can paste your resume text or click Retry.';
  };

  const processFile = async (targetFile: File) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Fast path 1: JSON resume exported from this app
      if (targetFile.name.endsWith('.json')) {
        setProcessStep('Importing structured JSON resume...');
        const text = await targetFile.text();
        const parsed = JSON.parse(text);
        if (parsed.personal || Array.isArray(parsed.experience)) {
          onSuccess(normalizeResumeData(parsed));
          onClose();
          return;
        }
      }

      // Fast path 2: Plain text or markdown resume file
      if (targetFile.name.endsWith('.txt') || targetFile.name.endsWith('.md')) {
        setProcessStep('Parsing text document...');
        const textContent = await targetFile.text();
        const res = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: textContent,
            fileName: targetFile.name,
          }),
        });
        const result = await res.json();
        if (result.data) {
          setProcessStep('Auto-populating all resume fields...');
          onSuccess(normalizeResumeData(result.data));
          onClose();
          return;
        }
      }

      setProcessStep('Reading file & extracting text...');

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setProcessStep('Analyzing resume and extracting experience & skills...');

          const res = await fetch('/api/parse-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              mimeType: targetFile.type || (targetFile.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
              fileName: targetFile.name,
            }),
          });

          const result = await res.json();
          if (!res.ok || result.error || !result.data) {
            throw new Error(result.error || 'Failed to extract resume data.');
          }

          setProcessStep('Auto-populating all resume fields...');
          onSuccess(normalizeResumeData(result.data));
          onClose();
        } catch (err: any) {
          console.error('File parsing error:', err);
          setErrorMessage(sanitizeErrorMessage(err));
        } finally {
          setIsProcessing(false);
          setProcessStep('');
        }
      };

      reader.onerror = () => {
        setIsProcessing(false);
        setErrorMessage('Failed to read the selected file. Please select a valid document.');
      };

      reader.readAsDataURL(targetFile);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(sanitizeErrorMessage(err));
    }
  };

  const handleProcessFile = () => {
    if (file) {
      processFile(file);
    }
  };

  const handleProcessPastedText = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please paste your resume text first.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProcessStep('Extracting structured fields from resume text...');

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: pastedText,
          mimeType: 'text/plain',
        }),
      });

      const result = await res.json();
      if (!res.ok || result.error || !result.data) {
        throw new Error(result.error || 'Failed to parse resume text.');
      }

      setProcessStep('Auto-populating all resume fields...');
      onSuccess(normalizeResumeData(result.data));
      onClose();
    } catch (err: any) {
      console.error('Text parsing error:', err);
      setErrorMessage(sanitizeErrorMessage(err));
    } finally {
      setIsProcessing(false);
      setProcessStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/40 rounded-lg text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Upload Resume & Auto-Populate
              </h2>
              <p className="text-xs text-slate-400">
                Gemini 3.8 Flash extracts your experience, education, skills, and contacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 pt-4 gap-2 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload Document (PDF / Image / Word)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste Resume Text</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center justify-between gap-3 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={activeTab === 'upload' ? handleProcessFile : handleProcessPastedText}
                disabled={isProcessing}
                className="shrink-0 px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-100 font-semibold rounded-lg text-xs transition-colors border border-rose-700/60 disabled:opacity-50 flex items-center gap-1.5 shadow"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : file
                    ? 'border-cyan-700/60 bg-slate-950/40'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/20'
                }`}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.docx,.doc,.txt,.json,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="p-3 bg-cyan-950/80 rounded-full border border-cyan-500/60 text-cyan-300">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                    <span className="text-sm font-semibold text-white">{file ? file.name : 'Processing document...'}</span>
                    <span className="text-xs text-cyan-300 font-medium animate-pulse">
                      {processStep || 'Analyzing resume and auto-populating fields...'}
                    </span>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-cyan-950/80 rounded-full border border-cyan-700/60 text-cyan-300">
                      <FileCheck2 className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-semibold text-white">{file.name}</span>
                    <span className="text-xs text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                    </span>
                    <label
                      htmlFor="resume-file-input"
                      className="mt-2 text-xs text-cyan-400 hover:underline cursor-pointer"
                    >
                      Choose another file
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="resume-file-input"
                    className="flex flex-col items-center gap-2 cursor-pointer w-full"
                  >
                    <div className="p-3 bg-slate-800 rounded-full text-cyan-400">
                      <Upload className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      Drop your resume here, or <span className="text-cyan-400">browse files</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Supports PDF, DOCX, PNG, JPG, or Scanned Images (Up to 10MB)
                    </span>
                  </label>
                )}
              </div>

              {/* Extraction Trigger */}
              <button
                type="button"
                onClick={handleProcessFile}
                disabled={!file || isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-cyan-950/50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{processStep || 'Processing with Gemini AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Populate Resume Fields</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Paste resume text or LinkedIn export:
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your resume contents here (Experience, Education, Skills, Contact details)..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={!pastedText.trim() || isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-cyan-950/50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{processStep || 'Parsing text with Gemini AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Parse Text & Auto-Populate</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Preset Sample Option */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Want to see how it looks first?
            </span>
            <button
              type="button"
              onClick={() => {
                onLoadSample();
                onClose();
              }}
              className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Load Synthetic Demo Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
