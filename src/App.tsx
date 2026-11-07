import React, { useState, useEffect } from 'react';
import { syntheticDemoResume, emptyResume } from './data/sampleResume';
import { ResumeData, TemplateStyle } from './types/resume';
import { JobApplicationRecord, ApplicationStatus } from './types/copilot';
import { ResumeFormEditor } from './components/ResumeFormEditor';
import { ResumePreview } from './components/ResumePreview';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { TemplateSelectorModal } from './components/TemplateSelectorModal';
import { AtsOptimizationModal } from './components/AtsOptimizationModal';
import { TopNav, MainNavView } from './components/TopNav';
import { CopilotWorkspace } from './components/copilot/CopilotWorkspace';
import { ApplicationsManager } from './components/copilot/ApplicationsManager';
import { downloadResumeAsPdf } from './utils/pdfGenerator';
import { downloadResumeAsDoc, downloadResumeAsDocx } from './utils/docGenerator';
import { normalizeResumeData } from './utils/normalizeResume';
import { RESUME_TEMPLATES } from './data/templates';
import { AuthScreen } from './components/AuthScreen';
import { UserAccount } from './types/auth';
import {
  saveMasterResumeToCloud,
  loadMasterResumeFromCloud,
} from './firebase/resumeRepository';
import {
  Sparkles,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Eye,
  Info,
  ShieldCheck,
} from 'lucide-react';

const STORAGE_DATA_KEY = 'executive_resume_data_v3';
const STORAGE_STATUS_KEY = 'executive_resume_has_uploaded_v3';
const PERSISTENT_APPLICATIONS_KEY = 'copilot_saved_applications_v2';
const SESSION_APPLICATIONS_KEY = 'copilot_session_applications_v1';

export default function App() {
  // 0. AUTHENTICATION & CANDIDATE ACCOUNT (Mandatory Name and Email to enter workspace)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('elite_auth_user_v1') || sessionStorage.getItem('elite_auth_user_v1');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return null;
  });

  // 1. MASTER PROFESSIONAL PROFILE (Faithfully maintained from previous session uploads)
  const [masterResume, setMasterResume] = useState<ResumeData>(() => {
    try {
      localStorage.removeItem('executive_resume_data_v1');
      localStorage.removeItem('executive_resume_data_v2');
      localStorage.removeItem('executive_resume_has_uploaded_v1');
      localStorage.removeItem('executive_resume_has_uploaded_v2');
    } catch (e) {
      // ignore
    }

    try {
      // Check user-specific storage first
      const savedUserStr = localStorage.getItem('elite_auth_user_v1') || sessionStorage.getItem('elite_auth_user_v1');
      let userSaved: string | null = null;
      let userKey: string | null = null;
      if (savedUserStr) {
        try {
          const userObj = JSON.parse(savedUserStr);
          if (userObj?.email) {
            userKey = `executive_resume_user_${userObj.email.toLowerCase().trim()}`;
            userSaved = localStorage.getItem(userKey);
          }
        } catch {
          // ignore
        }
      }

      // Fallback to global uploaded resume storage
      const globalSaved = localStorage.getItem(STORAGE_DATA_KEY);
      const saved = userSaved || globalSaved;

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.personal?.fullName?.trim() || (parsed.experience && parsed.experience.length > 0) || parsed.summary?.trim())) {
          return normalizeResumeData(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved resume from localStorage:', e);
    }
    return normalizeResumeData(emptyResume);
  });

  // 2. SAVED JOB APPLICATIONS (Maintained across browser sessions in localStorage)
  const [applications, setApplications] = useState<JobApplicationRecord[]>(() => {
    try {
      const savedApps = localStorage.getItem(PERSISTENT_APPLICATIONS_KEY) || sessionStorage.getItem(SESSION_APPLICATIONS_KEY);
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved applications:', e);
    }
    return [];
  });

  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(() => {
    return applications[0]?.id || null;
  });

  // Main View Switcher
  const [currentView, setCurrentView] = useState<MainNavView>('master_editor');

  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>('ats-corporate-clean');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Auto-save master profile across browser sessions & Firestore Cloud Database
  useEffect(() => {
    const hasContent = Boolean(
      masterResume.personal?.fullName?.trim() ||
      (masterResume.experience && masterResume.experience.length > 0) ||
      masterResume.summary?.trim()
    );
    if (!hasContent) return;

    try {
      localStorage.setItem(STORAGE_STATUS_KEY, 'true');
      localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(masterResume));
      if (currentUser?.email) {
        localStorage.setItem(`executive_resume_user_${currentUser.email.toLowerCase().trim()}`, JSON.stringify(masterResume));
      }
    } catch (e) {
      console.error('Failed to save resume data to localStorage:', e);
    }

    // Debounced cloud save to Firestore database
    if (currentUser?.id) {
      const timer = setTimeout(async () => {
        setCloudSyncStatus('saving');
        const res = await saveMasterResumeToCloud(currentUser.id, masterResume);
        setCloudSyncStatus(res.success ? 'synced' : 'offline');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [masterResume, currentUser]);

  // Auto-save session applications to persistent localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PERSISTENT_APPLICATIONS_KEY, JSON.stringify(applications));
      sessionStorage.setItem(SESSION_APPLICATIONS_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to save persistent applications:', e);
    }
  }, [applications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleManualCloudSave = async () => {
    if (!currentUser?.id) {
      showToast('Please sign in to save to Cloud Database.');
      return;
    }
    setCloudSyncStatus('saving');
    showToast('Saving Master Resume & Photo to Firestore Cloud Database...');
    const res = await saveMasterResumeToCloud(currentUser.id, masterResume);
    setCloudSyncStatus(res.success ? 'synced' : 'offline');
    if (res.success) {
      showToast('Master Resume & Photo saved to Cloud Database!');
    } else {
      showToast(res.error || 'Saved safely to local storage.');
    }
  };

  const handleLoginSuccess = async (user: UserAccount) => {
    setCurrentUser(user);
    setCloudSyncStatus('saving');

    // 1. Try loading directly from Firestore Cloud Database
    try {
      const cloudResume = await loadMasterResumeFromCloud(user.id);
      if (cloudResume && (cloudResume.personal?.fullName?.trim() || cloudResume.experience?.length > 0 || cloudResume.summary?.trim())) {
        setMasterResume(cloudResume);
        setCloudSyncStatus('synced');
        showToast(`Welcome back, ${user.fullName}! Restored Master Resume & Photo from Cloud Database.`);
        return;
      }
    } catch (cloudErr) {
      console.warn('[Cloud Database] Could not load from cloud:', cloudErr);
    }

    // 2. Fallback to localStorage from previous session
    const userKey = `executive_resume_user_${user.email.toLowerCase().trim()}`;
    const userSaved = localStorage.getItem(userKey);
    const globalSaved = localStorage.getItem(STORAGE_DATA_KEY);
    const saved = userSaved || globalSaved;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.personal?.fullName?.trim() || (parsed.experience && parsed.experience.length > 0) || parsed.summary?.trim())) {
          const normalized = normalizeResumeData(parsed);
          setMasterResume(normalized);
          // Sync to ensure both userKey and global key are current
          try {
            localStorage.setItem(userKey, JSON.stringify(normalized));
            localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(normalized));
            localStorage.setItem(STORAGE_STATUS_KEY, 'true');
          } catch {}
          // Push to cloud database asynchronously
          saveMasterResumeToCloud(user.id, normalized)
            .then((res) => setCloudSyncStatus(res.success ? 'synced' : 'offline'))
            .catch(() => setCloudSyncStatus('offline'));

          showToast(`Welcome back, ${user.fullName}! Restored your resume from previous session.`);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse previous session resume:', e);
      }
    }

    setCloudSyncStatus('synced');
    // 3. If no previous upload, initialize blank resume with their verified account details
    setMasterResume({
      ...normalizeResumeData(emptyResume),
      personal: {
        ...emptyResume.personal,
        fullName: user.fullName,
        email: user.email,
        headline: user.headline || '',
      },
    });
    showToast(`Welcome, ${user.fullName}! Workspace ready.`);
  };

  const handleSignOut = () => {
    try {
      if (currentUser?.email) {
        const hasContent = Boolean(
          masterResume.personal?.fullName?.trim() ||
          (masterResume.experience && masterResume.experience.length > 0) ||
          masterResume.summary?.trim()
        );
        if (hasContent) {
          const userKey = `executive_resume_user_${currentUser.email.toLowerCase().trim()}`;
          localStorage.setItem(userKey, JSON.stringify(masterResume));
          localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(masterResume));
          localStorage.setItem(STORAGE_STATUS_KEY, 'true');
        }
      }
      localStorage.removeItem('elite_auth_user_v1');
      sessionStorage.removeItem('elite_auth_user_v1');
    } catch (e) {
      console.warn('Error during sign out storage:', e);
    }
    setCurrentUser(null);
    setMasterResume(normalizeResumeData(emptyResume));
    showToast('Signed out of candidate workspace. Your resume is safely preserved.');
  };

  const handleLoadSample = () => {
    const sample = normalizeResumeData(syntheticDemoResume);
    setMasterResume(sample);
    try {
      localStorage.setItem(STORAGE_STATUS_KEY, 'true');
      localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(sample));
    } catch (e) {
      // ignore
    }
    showToast('Loaded synthetic demo profile into Master Profile!');
  };

  const handleReset = () => {
    setMasterResume(normalizeResumeData(emptyResume));
    try {
      localStorage.removeItem(STORAGE_STATUS_KEY);
      localStorage.removeItem(STORAGE_DATA_KEY);
    } catch (e) {
      // ignore
    }
    showToast('Master Profile cleared to blank state.');
  };

  const handleSelectTemplate = (newTemplate: TemplateStyle) => {
    setTemplateStyle(newTemplate);
    const tpl = RESUME_TEMPLATES.find((t) => t.id === newTemplate);
    if (tpl) {
      showToast(`Applied ${tpl.name} (${tpl.atsScore}% ATS Score)`);
    }
  };

  // Helper to create a new job application record
  const createNewApplication = (): JobApplicationRecord => {
    const newId = `app-${Date.now()}`;
    const newApp: JobApplicationRecord = {
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyName: 'Target Organization',
      jobTitle: masterResume.personal?.headline || 'Target Role',
      status: 'not_applied',
      jobDescription: {
        jobTitle: '',
        company: '',
        rawText: '',
        sourceType: 'pasted',
        summary: '',
        mandatorySkills: [],
        preferredSkills: [],
        coreResponsibilities: [],
        qualifications: [],
        implicitPriorities: [],
      },
      matchAnalysis: {
        overallAlignmentScore: 0,
        categoryScores: {
          experience: 0,
          skills: 0,
          responsibilities: 0,
          qualifications: 0,
          industry: 0,
          seniority: 0,
        },
        weights: {
          experience: 30,
          skills: 25,
          responsibilities: 20,
          qualifications: 10,
          industry: 10,
          seniority: 5,
        },
        requirements: [],
        strengths: [],
        missingRequirements: [],
        confirmationItems: [],
        positioningStrategy: {
          recommendedHeadline: masterResume.personal?.headline || 'Executive Leader',
          positioningAngle: 'Targeted executive positioning aligning documented experience with role deliverables.',
          priorityExperiences: (masterResume.experience || []).slice(0, 2).map((e) => e.company),
          emphasizedSkills: (masterResume.skills || []).slice(0, 5).map((s) => s.name),
          deemphasizedSkills: [],
          strategicRationale: 'Initial baseline positioning before job description ingestion.',
        },
      },
      tailoredResume: { ...masterResume },
      coverLetter: {
        companyName: 'Target Organization',
        jobTitle: masterResume.personal?.headline || 'Target Role',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        tone: 'executive',
        length: 'standard',
        openingParagraph: `I am writing to express my strong interest in the ${masterResume.personal?.headline || 'Executive Professional'} opportunity at Target Organization. Bringing over a decade of demonstrated leadership in enterprise technology strategy, cross-functional delivery, and high-impact digital solutions, I offer a verified track record of translating complex organizational visions into measurable, scalable results.`,
        relevanceParagraph: `With extensive expertise spanning technical roadmaps, systems architecture, and stakeholder governance, I have repeatedly delivered high-stakes transformations. As Senior Director at Apex Global Technologies, I spearheaded multi-region cloud infrastructure scaling with 99.99% service uptime while curtailing OPEX by 22%, and engineered automated compliance systems. Earlier at Vanguard Cloud Systems, I steered cross-functional teams to scale core SaaS platforms to over 1.2M active users while boosting engagement velocity by 28%.`,
        evidenceParagraph: `My background aligns directly with the strategic requirements of this role. I combine senior technical stewardship—encompassing ERP deployments, cloud reliability, vendor governance, and cyber compliance—with agile product lifecycle orchestration. Having managed complex stakeholder matrices across international markets, I understand how to translate ambitious business objectives into pragmatic delivery roadmaps, eliminate operational bottlenecks, and lead cross-disciplinary teams to peak velocity.`,
        employerFitParagraph: `From day one, my focus will be on accelerating organizational velocity and driving measurable business impact. I will establish operational observability across your core technology initiatives, optimize vendor SLAs and infrastructure spending, and implement robust delivery governance that reduces cycle times without sacrificing security. By uniting commercial acumen with rigorous technical execution, I am committed to delivering resilient platforms, scalable processes, and lasting ROI.`,
        closingParagraph: `Thank you for your consideration. I welcome the opportunity to discuss how my verified background, leadership discipline, and execution focus can support your ongoing success.`,
      },
      diffChanges: [],
      claims: [],
    };
    return newApp;
  };

  // Trigger "+ TAILOR RESUME FOR A JOB"
  const handleTailorForJob = () => {
    const newApp = createNewApplication();
    setApplications((prev) => [newApp, ...prev]);
    setActiveApplicationId(newApp.id);
    setCurrentView('copilot_workspace');
    showToast('New Job Application Workspace created!');
  };

  // Get active application or fallback
  const activeApplication: JobApplicationRecord =
    applications.find((a) => a.id === activeApplicationId) ||
    applications[0] ||
    createNewApplication();

  const handleUpdateActiveApplication = (updated: JobApplicationRecord) => {
    setApplications((prev) => {
      const exists = prev.some((a) => a.id === updated.id);
      if (exists) {
        return prev.map((a) => (a.id === updated.id ? updated : a));
      }
      return [updated, ...prev];
    });
  };

  const handleDuplicateApplication = (id: string) => {
    const target = applications.find((a) => a.id === id);
    if (!target) return;
    const duplicated: JobApplicationRecord = {
      ...target,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyName: `${target.companyName} (Copy)`,
    };
    setApplications((prev) => [duplicated, ...prev]);
    setActiveApplicationId(duplicated.id);
    showToast(`Duplicated application for ${target.companyName}`);
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (activeApplicationId === id) {
      const remaining = applications.filter((a) => a.id !== id);
      setActiveApplicationId(remaining[0]?.id || null);
    }
    showToast('Application removed from session.');
  };

  const handleUpdateApplicationStatus = (id: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );
    showToast(`Status updated to ${status.replace('_', ' ')}`);
  };

  // Download PDF with dynamic naming: {CandidateName}_{RoleTitle}_Resume.pdf
  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      showToast('Generating PDF file from current resume fields...');
      const targetResume =
        currentView === 'copilot_workspace'
          ? activeApplication.tailoredResume || masterResume
          : masterResume;
      const candidateName = (targetResume.personal.fullName || 'Candidate').trim();
      const roleName = (
        currentView === 'copilot_workspace'
          ? activeApplication.jobTitle || targetResume.personal.headline || 'Resume'
          : targetResume.personal.headline || 'Resume'
      ).trim();

      const filename = `${candidateName.replace(/\s+/g, '_')}_${roleName.replace(/\s+/g, '_')}_Resume.pdf`;

      await downloadResumeAsPdf('resume-print-canvas', {
        filename,
        onSuccess: () => {
          showToast('Resume PDF downloaded successfully!');
        },
        onError: (_err) => {
          showToast('Opening print dialog for PDF export...');
          window.print();
        },
      });
    } catch (_err) {
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintVector = () => {
    window.print();
  };

  // Download DOCX with dynamic naming: {CandidateName}_{RoleTitle}_Resume.docx
  const handleDownloadDoc = async (format: 'doc' | 'docx' = 'docx') => {
    try {
      const targetResume =
        currentView === 'copilot_workspace'
          ? activeApplication.tailoredResume || masterResume
          : masterResume;
      const candidateName = (targetResume.personal.fullName || 'Candidate').trim();
      const roleName = (
        currentView === 'copilot_workspace'
          ? activeApplication.jobTitle || targetResume.personal.headline || 'Resume'
          : targetResume.personal.headline || 'Resume'
      ).trim();

      const filename = `${candidateName.replace(/\s+/g, '_')}_${roleName.replace(/\s+/g, '_')}_Resume.${format}`;

      showToast(`Preparing Word document (${format.toUpperCase()})...`);
      if (format === 'docx') {
        await downloadResumeAsDocx(targetResume, filename, templateStyle);
        showToast('Resume downloaded as Word document (.docx)!');
      } else {
        await downloadResumeAsDoc(targetResume, filename, templateStyle);
        showToast('Resume downloaded as Word document (.doc)!');
      }
    } catch (err) {
      console.error('Word export error:', err);
      showToast('Failed to generate Word document.');
    }
  };

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(masterResume, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `${(masterResume.personal.fullName || 'Master_Resume').replace(/\s+/g, '_')}_Profile.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Master Profile exported as JSON.');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.personal || Array.isArray(parsed.experience)) {
          setMasterResume(normalizeResumeData(parsed));
          showToast('Master Profile imported successfully!');
        } else {
          alert('Invalid resume JSON format.');
        }
      } catch (err) {
        alert('Could not parse the selected JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSuccess = async (extractedData: ResumeData) => {
    const normalized = normalizeResumeData(extractedData);
    const updated: ResumeData = {
      ...normalized,
      personal: {
        ...normalized.personal,
        fullName: normalized.personal?.fullName?.trim() || currentUser?.fullName || '',
        email: normalized.personal?.email?.trim() || currentUser?.email || '',
        photoUrl: normalized.personal?.photoUrl || masterResume.personal?.photoUrl || '',
      },
    };

    setMasterResume(updated);

    // Save immediately to persistent storage
    try {
      localStorage.setItem(STORAGE_STATUS_KEY, 'true');
      localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(updated));
      if (currentUser?.email) {
        localStorage.setItem(`executive_resume_user_${currentUser.email.toLowerCase().trim()}`, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to save uploaded resume:', e);
    }

    // Save directly to Firestore Cloud Database
    if (currentUser?.id) {
      setCloudSyncStatus('saving');
      const cloudRes = await saveMasterResumeToCloud(currentUser.id, updated);
      setCloudSyncStatus(cloudRes.success ? 'synced' : 'offline');
    }

    showToast('Resume & photo uploaded! Master Profile saved to Cloud Database.');
  };

  // MANDATORY LOGIN / SIGN UP GATE: Tool cannot be accessed until user signs in or creates an account
  if (!currentUser) {
    return (
      <>
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-cyan-500/50 text-cyan-200 text-xs font-semibold rounded-xl shadow-2xl animate-fade-in no-print">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar with View Switcher & + TAILOR RESUME FOR A JOB */}
      <TopNav
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        onDownloadPdf={handleDownloadPdf}
        onDownloadDoc={handleDownloadDoc}
        onPrintVector={handlePrintVector}
        isDownloadingPdf={isDownloadingPdf}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        templateStyle={templateStyle}
        onOpenTemplateSelector={() => setIsTemplateModalOpen(true)}
        onOpenAtsOptimizer={() => setIsAtsModalOpen(true)}
        onTailorForJob={handleTailorForJob}
        applicationsCount={applications.length}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        cloudSyncStatus={cloudSyncStatus}
        onManualCloudSave={handleManualCloudSave}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-cyan-500/50 text-cyan-200 text-xs font-semibold rounded-xl shadow-2xl animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW 1: MASTER RESUME PROFESSIONAL PROFILE EDITOR */}
      {currentView === 'master_editor' && (
        <>
          {/* Privacy & Master Profile Banner */}
          <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 no-print">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Master Professional Profile:</strong> Immutable source of truth. Tailored job resumes branch independently and never overwrite it.
              </span>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex items-center justify-center p-2 bg-slate-900 border-b border-slate-800 no-print">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full max-w-xs">
              <button
                onClick={() => setMobileTab('editor')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  mobileTab === 'editor'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Form Editor</span>
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  mobileTab === 'preview'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          {/* Main Dual-Pane Editor & Preview */}
          <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Left: Master Form Editor */}
            <div
              className={`lg:col-span-5 xl:col-span-5 h-[calc(100vh-8rem)] ${
                mobileTab === 'editor' ? 'block' : 'hidden lg:block'
              } no-print`}
            >
              <ResumeFormEditor
                data={masterResume}
                onChange={setMasterResume}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onLoadSample={handleLoadSample}
              />
            </div>

            {/* Right: Master Live Preview */}
            <div
              className={`lg:col-span-7 xl:col-span-7 h-[calc(100vh-8rem)] ${
                mobileTab === 'preview' ? 'block' : 'hidden lg:block'
              }`}
            >
              <ResumePreview
                data={masterResume}
                templateStyle={templateStyle}
                onSelectTemplate={handleSelectTemplate}
                onOpenTemplateSelector={() => setIsTemplateModalOpen(true)}
                onOpenAtsOptimizer={() => setIsAtsModalOpen(true)}
                onDownloadPdf={handleDownloadPdf}
                onDownloadDoc={handleDownloadDoc}
                onPrintVector={handlePrintVector}
                isDownloadingPdf={isDownloadingPdf}
                onChangePhotoAlignment={(alignment) => {
                  setMasterResume((prev) => ({
                    ...prev,
                    personal: {
                      ...prev.personal,
                      photoAlignment: alignment,
                    },
                  }));
                  showToast(`Photo aligned to ${alignment}`);
                }}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onLoadSample={handleLoadSample}
              />
            </div>
          </main>
        </>
      )}

      {/* VIEW 2: AI JOB APPLICATION COPILOT WORKSPACE */}
      {currentView === 'copilot_workspace' && (
        <CopilotWorkspace
          masterResume={masterResume}
          activeApplication={activeApplication}
          templateStyle={templateStyle}
          onUpdateApplication={handleUpdateActiveApplication}
          onSelectTemplate={handleSelectTemplate}
          onOpenTemplateSelector={() => setIsTemplateModalOpen(true)}
          onOpenAtsOptimizer={() => setIsAtsModalOpen(true)}
          onDownloadResumePdf={handleDownloadPdf}
          onDownloadResumeDocx={handleDownloadDoc}
          onPrintVector={handlePrintVector}
          isDownloadingPdf={isDownloadingPdf}
          onShowToast={showToast}
        />
      )}

      {/* VIEW 3: MY JOB APPLICATIONS TRACKER */}
      {currentView === 'applications_manager' && (
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
          <ApplicationsManager
            applications={applications}
            activeApplicationId={activeApplicationId}
            onSelectApplication={(id) => {
              setActiveApplicationId(id);
              setCurrentView('copilot_workspace');
            }}
            onDuplicateApplication={handleDuplicateApplication}
            onDeleteApplication={handleDeleteApplication}
            onUpdateStatus={handleUpdateApplicationStatus}
            onCreateNewApplication={handleTailorForJob}
          />
        </main>
      )}

      {/* Upload & Auto-Populate Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        onLoadSample={handleLoadSample}
      />

      {/* Format Selector Modal (5 ATS & Executive Templates) */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        selectedTemplate={templateStyle}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* ATS Scanner & Optimization Modal */}
      <AtsOptimizationModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        data={currentView === 'copilot_workspace' ? activeApplication.tailoredResume || masterResume : masterResume}
        templateStyle={templateStyle}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
