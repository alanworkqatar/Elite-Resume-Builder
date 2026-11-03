import React, { useRef } from 'react';
import { CoverLetterData } from '../../types/copilot';
import { PersonalDetails } from '../../types/resume';
import { downloadCoverLetterAsDocx } from '../../utils/coverLetterDocGenerator';
import { Download, Printer, FileText, CheckCircle2 } from 'lucide-react';

interface CoverLetterPreviewProps {
  personal: PersonalDetails;
  coverLetter: CoverLetterData;
  onShowToast?: (msg: string) => void;
}

export function CoverLetterPreview({
  personal,
  coverLetter,
  onShowToast,
}: CoverLetterPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const [formatMode, setFormatMode] = React.useState<'pillars' | 'narrative'>('pillars');

  const cleanName = (personal.fullName || 'Candidate_Name').trim().replace(/\s+/g, '_');
  const cleanTitle = (coverLetter.jobTitle || 'Role').trim().replace(/\s+/g, '_');

  const handleDownloadDocx = async () => {
    try {
      if (onShowToast) onShowToast('Generating Word (.docx) cover letter...');
      const filename = `${cleanName}_${cleanTitle}_Cover_Letter.docx`;
      await downloadCoverLetterAsDocx(personal, coverLetter, filename, formatMode);
      if (onShowToast) onShowToast('Cover Letter (.docx) downloaded successfully!');
    } catch (err) {
      console.error('Failed to export cover letter docx:', err);
      if (onShowToast) onShowToast('Failed to download Word cover letter.');
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow no-print">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Cover Letter Stationery
            </span>
          </div>

          {/* Format Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFormatMode('pillars')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                formatMode === 'pillars'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show distinct 3-pillar executive headings"
            >
              3-Pillar Executive
            </button>
            <button
              type="button"
              onClick={() => setFormatMode('narrative')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                formatMode === 'narrative'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show continuous executive letter prose"
            >
              Standard Narrative
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadDocx}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Word (.docx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* A4 Letterhead Canvas */}
      <div className="flex-1 overflow-y-auto flex justify-center p-2 sm:p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
        <div
          ref={printRef}
          id="cover-letter-print-canvas"
          className="w-full max-w-[800px] bg-white text-slate-800 p-8 sm:p-14 shadow-2xl rounded-sm min-h-[1050px] flex flex-col font-sans border border-slate-200"
          style={{ fontFamily: 'Calibri, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          {/* Candidate Letterhead */}
          <div className="border-b-2 border-slate-200 pb-5 mb-7">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              {personal.fullName || 'EXECUTIVE CANDIDATE'}
            </h1>
            <p className="text-sm font-bold text-cyan-700 uppercase tracking-wider mt-0.5">
              {personal.headline || coverLetter.jobTitle || 'Executive Professional'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>• {personal.phone}</span>}
              {personal.location && <span>• {personal.location}</span>}
              {personal.linkedin && <span>• {personal.linkedin}</span>}
            </div>
          </div>

          {/* Date */}
          <div className="text-xs font-semibold text-slate-500 mb-6">
            {coverLetter.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          {/* Recipient Block */}
          <div className="text-xs text-slate-700 mb-6 space-y-0.5">
            <p className="font-bold text-slate-900">{coverLetter.recipientName || 'Hiring Manager'}</p>
            <p>{coverLetter.recipientTitle || 'Recruitment & Talent Team'}</p>
            <p className="font-semibold text-slate-800">{coverLetter.companyName || 'Target Organization'}</p>
          </div>

          {/* Subject Line */}
          <div className="text-xs font-bold text-cyan-800 uppercase tracking-wider mb-5">
            Re: Application for {coverLetter.jobTitle || 'the Position'}
          </div>

          {/* Salutation */}
          <div className="text-xs font-bold text-slate-900 mb-4">
            Dear {coverLetter.recipientName || 'Hiring Manager'},
          </div>

          {/* Letter Body Paragraphs */}
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed text-justify flex-1">
            {coverLetter.openingParagraph && (
              <p className="leading-relaxed">{coverLetter.openingParagraph}</p>
            )}

            {formatMode === 'pillars' ? (
              <>
                {/* 1. Relevant Experience & Proven Achievements */}
                {coverLetter.relevanceParagraph && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-bold tracking-wide text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <span className="text-cyan-700 font-mono font-black">01 ·</span>
                      <span>My Relevant Experience, Expertise & Proven Achievements</span>
                    </div>
                    <p className="leading-relaxed text-slate-700 pt-0.5">{coverLetter.relevanceParagraph}</p>
                  </div>
                )}

                {/* 02. Why I am the right fit */}
                {coverLetter.evidenceParagraph && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-bold tracking-wide text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <span className="text-cyan-700 font-mono font-black">02 ·</span>
                      <span>Why I Am the Right Fit (Role Alignment)</span>
                    </div>
                    <p className="leading-relaxed text-slate-700 pt-0.5">{coverLetter.evidenceParagraph}</p>
                  </div>
                )}

                {/* 03 · VALUE: What I can deliver */}
                {coverLetter.employerFitParagraph && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-bold tracking-wide text-slate-900 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <span className="text-cyan-700 font-mono font-black">03 ·</span>
                      <span>VALUE: What I Can Deliver (Business Impact)</span>
                    </div>
                    <p className="leading-relaxed text-slate-700 pt-0.5">{coverLetter.employerFitParagraph}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {coverLetter.relevanceParagraph && <p className="leading-relaxed">{coverLetter.relevanceParagraph}</p>}
                {coverLetter.evidenceParagraph && <p className="leading-relaxed">{coverLetter.evidenceParagraph}</p>}
                {coverLetter.employerFitParagraph && <p className="leading-relaxed">{coverLetter.employerFitParagraph}</p>}
              </>
            )}

            {coverLetter.closingParagraph && (
              <p className="leading-relaxed pt-1">{coverLetter.closingParagraph}</p>
            )}
          </div>

          {/* Sign-off */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-xs">
            <p className="text-slate-600 mb-3">Sincerely,</p>
            <p className="font-bold text-sm text-slate-900 uppercase tracking-tight">
              {personal.fullName || 'Candidate Name'}
            </p>
            <p className="text-slate-600 font-medium">
              {personal.headline || coverLetter.jobTitle || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
