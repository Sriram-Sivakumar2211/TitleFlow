import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  ArrowRight, 
  FileText, 
  Users, 
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const OnboardingSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = location.state as {
    organizationName?: string;
    accountHolder?: string;
    orgType?: string;
    userEmail?: string;
  } || {};

  const orgName = state.organizationName || 'Pacific Premier Title & Escrow';
  const holder = state.accountHolder || (user ? user.full_name : 'Principal Officer');
  const orgType = (state.orgType || 'TITLE_COMPANY').replace(/_/g, ' ');

  const handleGoToDashboard = () => {
    // If user state is loaded or token is present, navigate directly to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">TitleFlow</span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Workspace Provisioned
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 flex flex-col items-center text-center">
        {/* Animated Success Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25">
            <CheckCircle2 className="w-9 h-9" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Your workspace is ready.
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-md">
          Welcome to TitleFlow. We've initialized your enterprise environment and security parameters.
        </p>

        {/* Workspace Summary Card */}
        <div className="mt-8 w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-left space-y-4 shadow-xl">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                Organization Workspace
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{orgName}</h3>
              <p className="text-xs text-slate-400">{orgType}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Designated Account Holder</span>
              <p className="text-slate-200 font-semibold mt-0.5">{holder}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Authorization Level</span>
              <p className="text-emerald-400 font-semibold mt-0.5">Workspace Owner / Closing Officer</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Security Isolation</span>
              <p className="text-slate-200 font-semibold mt-0.5">Multi-Tenant Scoped</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">AI Document Engine</span>
              <p className="text-purple-400 font-semibold mt-0.5">Automated Triage Active</p>
            </div>
          </div>
        </div>

        {/* Recommended Next Actions */}
        <div className="mt-6 w-full rounded-2xl bg-slate-900/40 border border-slate-800/60 p-5 text-left space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Next Recommended Actions
          </span>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Create your first property transaction or open an existing escrow file.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Upload deeds or preliminary title commitments for automatic AI analysis.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Invite closing team members from the organization management settings.</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 w-full sm:w-auto">
          <button
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition shadow-lg shadow-sky-600/30 active:scale-[0.99]"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        TitleFlow Digital Title & Escrow Closing Infrastructure
      </footer>
    </div>
  );
};
