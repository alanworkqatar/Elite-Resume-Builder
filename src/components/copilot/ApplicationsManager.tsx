import React from 'react';
import { JobApplicationRecord, ApplicationStatus } from '../../types/copilot';
import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  TrendingUp,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ApplicationsManagerProps {
  applications: JobApplicationRecord[];
  activeApplicationId?: string | null;
  onSelectApplication: (id: string) => void;
  onDuplicateApplication: (id: string) => void;
  onDeleteApplication: (id: string) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onCreateNewApplication: () => void;
}

export function ApplicationsManager({
  applications,
  activeApplicationId,
  onSelectApplication,
  onDuplicateApplication,
  onDeleteApplication,
  onUpdateStatus,
  onCreateNewApplication,
}: ApplicationsManagerProps) {
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'offer_received':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/30';
      case 'interview':
        return 'bg-purple-950 text-purple-300 border-purple-500/30';
      case 'applied':
        return 'bg-blue-950 text-blue-300 border-blue-500/30';
      case 'ready_to_apply':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/30';
      case 'rejected':
        return 'bg-rose-950 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const statusLabels: Record<ApplicationStatus, string> = {
    not_applied: 'Not Applied',
    ready_to_apply: 'Ready to Apply',
    applied: 'Applied',
    interview: 'Interview',
    rejected: 'Rejected',
    offer_received: 'Offer Received',
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>My Job Applications</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
              {applications.length} Tracked
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Every application retains its own tailored resume and cover letter package without altering the Master Resume.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNewApplication}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tailor for New Job</span>
        </button>
      </div>

      {/* Applications Grid / Table */}
      {applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => {
            const isActive = app.id === activeApplicationId;
            return (
              <div
                key={app.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Status & Match Score */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-transparent cursor-pointer focus:outline-none ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      <option value="not_applied" className="bg-slate-900 text-white">Not Applied</option>
                      <option value="ready_to_apply" className="bg-slate-900 text-white">Ready to Apply</option>
                      <option value="applied" className="bg-slate-900 text-white">Applied</option>
                      <option value="interview" className="bg-slate-900 text-white">Interview</option>
                      <option value="offer_received" className="bg-slate-900 text-white">Offer Received</option>
                      <option value="rejected" className="bg-slate-900 text-white">Rejected</option>
                    </select>

                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-cyan-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{app.matchAnalysis?.overallAlignmentScore || 80}% Match</span>
                    </div>
                  </div>

                  {/* Role & Company */}
                  <h4 className="text-sm font-bold text-white tracking-tight truncate">
                    {app.jobTitle || 'Target Role'}
                  </h4>
                  <p className="text-xs text-cyan-300 font-medium truncate flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>{app.companyName || 'Target Organization'}</span>
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Created: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectApplication(app.id)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Active Workspace' : 'Open Workspace'}</span>
                  </button>

                  <button
                    type="button"
                    title="Duplicate application with new job description"
                    onClick={() => onDuplicateApplication(app.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Delete application"
                    onClick={() => {
                      if (window.confirm(`Delete application for ${app.companyName}?`)) {
                        onDeleteApplication(app.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">No Tailored Applications Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Upload or paste any job description to create your first customized resume and cover letter package.
          </p>
          <button
            type="button"
            onClick={onCreateNewApplication}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            + Create First Job Application
          </button>
        </div>
      )}
    </div>
  );
}
