import React, { useState } from 'react';
import { ClaimVerificationItem, ClaimStatus } from '../../types/copilot';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';

interface ClaimVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims: ClaimVerificationItem[];
  onConfirmClaim?: (claimId: string) => void;
}

export function ClaimVerificationModal({
  isOpen,
  onClose,
  claims,
  onConfirmClaim,
}: ClaimVerificationModalProps) {
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | 'ALL'>('ALL');

  if (!isOpen) return null;

  const verifiedCount = claims.filter((c) => c.status === 'VERIFIED').length;
  const needsConfirmCount = claims.filter((c) => c.status === 'NEEDS CONFIRMATION').length;
  const unsupportedCount = claims.filter((c) => c.status === 'UNSUPPORTED').length;

  const filteredClaims = claims.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Factual Integrity & Claim Verification Audit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every generated statement is mapped directly to verified source evidence.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Filters Bar */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Claims ({claims.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('VERIFIED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'VERIFIED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified ({verifiedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('NEEDS CONFIRMATION')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'NEEDS CONFIRMATION'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Needs Confirmation ({needsConfirmCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('UNSUPPORTED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'UNSUPPORTED'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Unsupported ({unsupportedCount})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            Strict Non-Negotiable Anti-Hallucination Standard
          </span>
        </div>

        {/* Claims Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filteredClaims.length > 0 ? (
            filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                  claim.status === 'VERIFIED'
                    ? 'bg-slate-950/60 border-slate-800'
                    : claim.status === 'NEEDS CONFIRMATION'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                {/* Status Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {claim.status === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> &lt;VERIFIED&gt;
                      </span>
                    )}
                    {claim.status === 'NEEDS CONFIRMATION' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> &lt;NEEDS CONFIRMATION&gt;
                      </span>
                    )}
                    {claim.status === 'UNSUPPORTED' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/70 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> &lt;UNSUPPORTED&gt;
                      </span>
                    )}

                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Section: {claim.targetSection}
                    </span>

                    {claim.isAiModifiedWording && (
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                        AI Polished Wording
                      </span>
                    )}
                  </div>

                  {claim.status === 'NEEDS CONFIRMATION' && onConfirmClaim && (
                    <button
                      type="button"
                      onClick={() => onConfirmClaim(claim.id)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Confirm as Accurate</span>
                    </button>
                  )}
                </div>

                {/* Claim Text */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                    Claim in Generated Document:
                  </span>
                  <p className="font-medium text-slate-200 leading-relaxed">
                    "{claim.claimText}"
                  </p>
                </div>

                {/* Traceable Evidence */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  <div>
                    <strong className="text-slate-300">Verified Evidence: </strong>
                    <span className="text-slate-300">{claim.originalSourceText || 'None documented'}</span>
                  </div>
                  {claim.sourceRole && (
                    <span className="text-cyan-300 font-mono text-[10px] shrink-0">
                      Source Role: {claim.sourceRole}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">
              No claims found for this status.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {verifiedCount} verified claims approved for export.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
