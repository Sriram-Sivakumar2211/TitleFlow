import React from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export const HeroDashboardPreview: React.FC = () => {
  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl bg-slate-900/90 p-2 sm:p-4 ring-1 ring-white/10 shadow-2xl backdrop-blur-xl">
      {/* Browser Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <div className="ml-3 hidden sm:flex items-center gap-2 rounded-md bg-slate-800/60 px-3 py-1 text-xs text-slate-400 border border-slate-700/50">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>app.titleflow.io/transactions/TXN-2026-10492</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Escrow Session
          </span>
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Closings</span>
              <Building2 className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">24</div>
            <div className="mt-1 flex items-center text-[11px] text-emerald-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+18% from last month</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Verified Documents</span>
              <FileCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">186</div>
            <div className="mt-1 text-[11px] text-slate-400">100% OCR indexed</div>
          </div>

          <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">AI Risk Checks</span>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">99.4%</div>
            <div className="mt-1 text-[11px] text-purple-300">Automated triage active</div>
          </div>

          <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/40">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Pending Review</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">3</div>
            <div className="mt-1 text-[11px] text-amber-300">Requires officer signoff</div>
          </div>
        </div>

        {/* Center Split: Transaction View + AI Findings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Transaction Card */}
          <div className="lg:col-span-2 rounded-xl bg-slate-800/40 p-4 sm:p-5 border border-slate-700/40 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sky-400 font-semibold">TXN-2026-10492</span>
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400 border border-sky-500/20">
                    UNDER REVIEW
                  </span>
                </div>
                <h4 className="text-base font-semibold text-white mt-1">742 Evergreen Terrace, Springfield, OR</h4>
                <p className="text-xs text-slate-400">Purchase Price: $485,000 • Escrow Deposit: $15,000</p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs text-slate-400">Estimated Closing</span>
                <p className="text-sm font-semibold text-slate-200">Dec 08, 2026</p>
              </div>
            </div>

            {/* Stepper / Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Closing Milestones</span>
                <span className="text-sky-400">Step 3 of 4 Complete</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                <div className="bg-sky-500 rounded-full" />
                <div className="bg-sky-500 rounded-full" />
                <div className="bg-sky-500 rounded-full" />
                <div className="bg-slate-700 rounded-full" />
              </div>
            </div>

            {/* Document Rows */}
            <div className="space-y-2 pt-2 border-t border-slate-700/40">
              <div className="text-xs font-medium text-slate-400">Associated Property Documents</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-700/30 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-200 font-medium">Preliminary_Title_Commitment_FirstAm.pdf</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> AI Extracted
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-700/30 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-200 font-medium">Purchase_and_Sale_Agreement_Executed.pdf</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk & Fraud Inspection Engine Card */}
          <div className="rounded-xl bg-slate-800/40 p-4 sm:p-5 border border-slate-700/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h4 className="text-sm font-semibold text-white">Title & Fraud Engine</h4>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Lien Inconsistency (Medium)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Prior mechanics lien recorded in 2024 requires formal satisfaction certificate before closing.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Wire Protection Active</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Routing & disbursement instructions dual-authenticated with issuing title underwriter.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/40 mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Audit Log Record</span>
              <span className="font-mono text-slate-300">#4902-SHA256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
