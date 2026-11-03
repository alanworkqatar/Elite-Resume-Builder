import React, { useState } from 'react';
import {
  JobApplicationRecord,
  JobDescriptionData,
  JobMatchAnalysis,
  DiffChangeItem,
  ClaimVerificationItem,
  CoverLetterData,
  MatchScoreWeights,
} from '../../types/copilot';
import { ResumeData, TemplateStyle } from '../../types/resume';
import { JobDescriptionInput } from './JobDescriptionInput';
import { RoleIntelligenceView } from './RoleIntelligenceView';
import { MatchDashboard } from './MatchDashboard';
import { CandidatePositioningCard } from './CandidatePositioningCard';
import { SeeWhatChangedView } from './SeeWhatChangedView';
import { ClaimVerificationModal } from './ClaimVerificationModal';
import { CoverLetterEditor } from './CoverLetterEditor';
import { CoverLetterPreview } from './CoverLetterPreview';
import { ResumePreview } from '../ResumePreview';
import { ResumeFormEditor } from '../ResumeFormEditor';
import {
  Briefcase,
  FileText,
  GitCompare,
  ShieldCheck,
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface CopilotWorkspaceProps {
  masterResume: ResumeData;
  activeApplication: JobApplicationRecord;
  templateStyle: TemplateStyle;
  onUpdateApplication: (app: JobApplicationRecord) => void;
  onSelectTemplate: (template: TemplateStyle) => void;
  onOpenTemplateSelector: () => void;
  onOpenAtsOptimizer: () => void;
  onDownloadResumePdf: () => void;
  onDownloadResumeDocx: (format?: 'doc' | 'docx') => void;
  onPrintVector: () => void;
  isDownloadingPdf: boolean;
  onShowToast: (msg: string) => void;
}

export function CopilotWorkspace({
  masterResume,
  activeApplication,
  templateStyle,
  onUpdateApplication,
  onSelectTemplate,
  onOpenTemplateSelector,
  onOpenAtsOptimizer,
  onDownloadResumePdf,
  onDownloadResumeDocx,
  onPrintVector,
  isDownloadingPdf,
  onShowToast,
}: CopilotWorkspaceProps) {
  const [rightTab, setRightTab] = useState<
    'tailored_resume' | 'cover_letter' | 'diff' | 'master_reference'
  >('tailored_resume');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isProcessingJob, setIsProcessingJob] = useState(false);
  const [isGeneratingTailored, setIsGeneratingTailored] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  // Ingest & Parse Job Description -> Then run Match
  const handleJobParsed = async (parsedJob: JobDescriptionData) => {
    setIsProcessingJob(true);
    try {
      onShowToast(`Analyzing ${parsedJob.jobTitle} at ${parsedJob.company}...`);

      // 1. Run semantic matching
      const matchRes = await fetch('/api/match-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          jobDescription: parsedJob,
        }),
      });

      const matchJson = await matchRes.json();
      if (!matchRes.ok || !matchJson.success) {
        throw new Error(matchJson.error || 'Failed to match requirements.');
      }

      const matchAnalysis: JobMatchAnalysis = matchJson.data;

      // Update application record
      onUpdateApplication({
        ...activeApplication,
        companyName: parsedJob.company || 'Target Organization',
        jobTitle: parsedJob.jobTitle || 'Target Role',
        jobDescription: parsedJob,
        matchAnalysis,
        updatedAt: new Date().toISOString(),
      });

      onShowToast(`Role analyzed: ${matchAnalysis.overallAlignmentScore}% alignment detected!`);
    } catch (err: any) {
      console.error('Matching error:', err);
      onShowToast(err.message || 'Error analyzing job requirements.');
    } finally {
      setIsProcessingJob(false);
    }
  };

  // Generate Tailored Resume, Cover Letter, and Claim Verification
  const handleGenerateTailoredApplication = async () => {
    if (!activeApplication.jobDescription?.summary && !activeApplication.jobDescription?.rawText) {
      onShowToast('Please provide a job description first.');
      return;
    }

    setIsGeneratingTailored(true);
    try {
      onShowToast('Synthesizing tailored resume with verified evidence...');

      // 1. Generate tailored resume
      const resumeRes = await fetch('/api/generate-tailored-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          jobDescription: activeApplication.jobDescription,
          positioningStrategy: activeApplication.matchAnalysis?.positioningStrategy,
          matchAnalysis: activeApplication.matchAnalysis,
        }),
      });

      const resumeJson = await resumeRes.json();
      if (!resumeRes.ok || !resumeJson.success) {
        throw new Error(resumeJson.error || 'Failed to tailor resume.');
      }

      const { tailoredResume, diffChanges } = resumeJson.data;

      // 2. Generate cover letter
      onShowToast('Drafting executive cover letter...');
      const letterRes = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          jobDescription: activeApplication.jobDescription,
          tone: activeApplication.coverLetter?.tone || 'executive',
          length: activeApplication.coverLetter?.length || 'standard',
          companyName: activeApplication.companyName,
          jobTitle: activeApplication.jobTitle,
        }),
      });

      const letterJson = await letterRes.json();
      const coverLetterData: CoverLetterData = letterJson.data || activeApplication.coverLetter;

      // 3. Factual claim verification
      onShowToast('Auditing claims against Master Resume...');
      const claimRes = await fetch('/api/verify-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          tailoredResume,
          coverLetter: coverLetterData,
        }),
      });

      const claimJson = await claimRes.json();
      const claims: ClaimVerificationItem[] = claimJson.data || [];

      // Update active application state
      onUpdateApplication({
        ...activeApplication,
        tailoredResume,
        diffChanges,
        coverLetter: coverLetterData,
        claims,
        status: 'ready_to_apply',
        updatedAt: new Date().toISOString(),
      });

      onShowToast('Tailored resume & cover letter generated successfully!');
      setRightTab('tailored_resume');
    } catch (err: any) {
      console.error('Tailoring error:', err);
      onShowToast(err.message || 'Error generating tailored application.');
    } finally {
      setIsGeneratingTailored(false);
    }
  };

  // Regenerate Cover Letter with specific tone / length
  const handleRegenerateCoverLetter = async (
    tone: 'executive' | 'persuasive' | 'concise',
    length: 'short' | 'standard'
  ) => {
    setIsGeneratingCoverLetter(true);
    try {
      onShowToast(`Rewriting cover letter in ${tone} tone (${length})...`);
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          jobDescription: activeApplication.jobDescription,
          tone,
          length,
          companyName: activeApplication.companyName,
          jobTitle: activeApplication.jobTitle,
          recipientName: activeApplication.coverLetter?.recipientName,
          recipientTitle: activeApplication.coverLetter?.recipientTitle,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed');

      onUpdateApplication({
        ...activeApplication,
        coverLetter: json.data,
        updatedAt: new Date().toISOString(),
      });
      onShowToast('Cover letter refreshed!');
    } catch (err) {
      onShowToast('Failed to regenerate cover letter.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Toggle single diff change accept/reject
  const handleToggleAcceptDiff = (diffId: string) => {
    const updatedDiffs = activeApplication.diffChanges.map((d) => {
      if (d.id === diffId) {
        return { ...d, accepted: !d.accepted };
      }
      return d;
    });

    onUpdateApplication({
      ...activeApplication,
      diffChanges: updatedDiffs,
    });
  };

  // Accept all diff changes
  const handleAcceptAllDiffs = () => {
    const updatedDiffs = activeApplication.diffChanges.map((d) => ({ ...d, accepted: true }));
    onUpdateApplication({
      ...activeApplication,
      diffChanges: updatedDiffs,
    });
    onShowToast('All AI improvements accepted.');
  };

  // Restore all original master text
  const handleRestoreAllOriginals = () => {
    const updatedDiffs = activeApplication.diffChanges.map((d) => ({ ...d, accepted: false }));
    onUpdateApplication({
      ...activeApplication,
      tailoredResume: { ...masterResume },
      diffChanges: updatedDiffs,
    });
    onShowToast('Restored all original Master Resume text.');
  };

  // Confirm claim in verification modal
  const handleConfirmClaim = (claimId: string) => {
    const updatedClaims = activeApplication.claims.map((c) => {
      if (c.id === claimId) {
        return { ...c, status: 'VERIFIED' as const, userConfirmed: true };
      }
      return c;
    });
    onUpdateApplication({
      ...activeApplication,
      claims: updatedClaims,
    });
    onShowToast('Claim confirmed as verified!');
  };

  const hasJob = Boolean(
    activeApplication.jobDescription?.summary || activeApplication.jobDescription?.rawText
  );

  return (
    <div className="flex-1 max-w-[1920px] w-full mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
      {/* ======================================================== */}
      {/* LEFT PANEL: ROLE INTELLIGENCE, MATCHING & CONTROLS       */}
      {/* ======================================================== */}
      <div className="lg:col-span-5 xl:col-span-5 h-[calc(100vh-5.5rem)] overflow-y-auto space-y-5 pr-1 no-print">
        {/* Step 1: Ingestion Input (Collapsible if parsed) */}
        <JobDescriptionInput
          onParsed={handleJobParsed}
          isLoading={isProcessingJob}
          initialData={activeApplication.jobDescription}
        />

        {/* Step 2: Role Intelligence Breakdown */}
        {hasJob && (
          <RoleIntelligenceView
            job={activeApplication.jobDescription}
            onEditJob={() => {
              // Focus back on text editor
            }}
          />
        )}

        {/* Step 3: Semantic Match Dashboard */}
        {activeApplication.matchAnalysis && (
          <MatchDashboard
            analysis={activeApplication.matchAnalysis}
            onGenerateTailored={handleGenerateTailoredApplication}
            isGenerating={isGeneratingTailored}
          />
        )}

        {/* Step 4: Strategic Positioning Card */}
        {activeApplication.matchAnalysis?.positioningStrategy && (
          <CandidatePositioningCard
            strategy={activeApplication.matchAnalysis.positioningStrategy}
          />
        )}
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: DOCUMENT WORKSPACE & COMPARISON             */}
      {/* ======================================================== */}
      <div className="lg:col-span-7 xl:col-span-7 h-[calc(100vh-5.5rem)] flex flex-col space-y-3 min-h-0">
        {/* Workspace Tab Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg shrink-0 no-print">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRightTab('tailored_resume')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rightTab === 'tailored_resume'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tailored Resume</span>
            </button>

            <button
              type="button"
              onClick={() => setRightTab('cover_letter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rightTab === 'cover_letter'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cover Letter</span>
            </button>

            <button
              type="button"
              onClick={() => setRightTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rightTab === 'diff'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>See What AI Changed</span>
              {activeApplication.diffChanges?.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300">
                  {activeApplication.diffChanges.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRightTab('master_reference')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rightTab === 'master_reference'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Master Profile Reference</span>
            </button>
          </div>

          {/* Audit & Verification Trigger */}
          <button
            type="button"
            onClick={() => setIsClaimModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Factual Claim Audit</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {rightTab === 'tailored_resume' && (
            <ResumePreview
              data={activeApplication.tailoredResume || masterResume}
              templateStyle={templateStyle}
              onSelectTemplate={onSelectTemplate}
              onOpenTemplateSelector={onOpenTemplateSelector}
              onOpenAtsOptimizer={onOpenAtsOptimizer}
              onDownloadPdf={onDownloadResumePdf}
              onDownloadDoc={onDownloadResumeDocx}
              onPrintVector={onPrintVector}
              isDownloadingPdf={isDownloadingPdf}
              onChangePhotoAlignment={(alignment) => {
                onUpdateApplication({
                  ...activeApplication,
                  tailoredResume: {
                    ...activeApplication.tailoredResume,
                    personal: {
                      ...activeApplication.tailoredResume.personal,
                      photoAlignment: alignment,
                    },
                  },
                });
              }}
            />
          )}

          {rightTab === 'cover_letter' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">
              <div className="xl:col-span-5 overflow-y-auto max-h-[calc(100vh-10rem)]">
                <CoverLetterEditor
                  data={
                    activeApplication.coverLetter || {
                      companyName: activeApplication.companyName,
                      jobTitle: activeApplication.jobTitle,
                      date: new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }),
                      tone: 'executive',
                      length: 'standard',
                      openingParagraph: '',
                      relevanceParagraph: '',
                      evidenceParagraph: '',
                      employerFitParagraph: '',
                      closingParagraph: '',
                    }
                  }
                  onChange={(updated) =>
                    onUpdateApplication({
                      ...activeApplication,
                      coverLetter: updated,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  onRegenerate={handleRegenerateCoverLetter}
                  isRegenerating={isGeneratingCoverLetter}
                />
              </div>

              <div className="xl:col-span-7 h-full">
                <CoverLetterPreview
                  personal={activeApplication.tailoredResume?.personal || masterResume.personal}
                  coverLetter={
                    activeApplication.coverLetter || {
                      companyName: activeApplication.companyName,
                      jobTitle: activeApplication.jobTitle,
                      date: new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }),
                      tone: 'executive',
                      length: 'standard',
                      openingParagraph: '',
                      relevanceParagraph: '',
                      evidenceParagraph: '',
                      employerFitParagraph: '',
                      closingParagraph: '',
                    }
                  }
                  onShowToast={onShowToast}
                />
              </div>
            </div>
          )}

          {rightTab === 'diff' && (
            <SeeWhatChangedView
              diffChanges={activeApplication.diffChanges || []}
              onToggleAcceptChange={handleToggleAcceptDiff}
              onAcceptAllChanges={handleAcceptAllDiffs}
              onRestoreAllOriginals={handleRestoreAllOriginals}
            />
          )}

          {rightTab === 'master_reference' && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>My Master Professional Profile (Source of Truth)</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Protected & Never Modified by Job Tailoring
                </span>
              </div>
              <ResumePreview
                data={masterResume}
                templateStyle={templateStyle}
                onSelectTemplate={onSelectTemplate}
                onOpenTemplateSelector={onOpenTemplateSelector}
                onOpenAtsOptimizer={onOpenAtsOptimizer}
                onDownloadPdf={onDownloadResumePdf}
                onDownloadDoc={onDownloadResumeDocx}
                onPrintVector={onPrintVector}
                isDownloadingPdf={isDownloadingPdf}
              />
            </div>
          )}
        </div>
      </div>

      {/* Claim Verification Modal */}
      <ClaimVerificationModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        claims={activeApplication.claims || []}
        onConfirmClaim={handleConfirmClaim}
      />
    </div>
  );
}
