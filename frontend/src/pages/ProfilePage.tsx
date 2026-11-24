import React from 'react';
import { User, ShieldCheck, Mail, Phone, Calendar, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Account & Security Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your credentials, authorized closing roles, and authenticated session parameters.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-bold">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.full_name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-1">
              <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {user?.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">User Identifier (UUID)</span>
            <span className="font-mono text-slate-800">{user?.id}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Contact Phone</span>
            <span className="text-slate-800 font-medium">{user?.phone || 'None registered'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Account Created</span>
            <span className="text-slate-800 font-mono">
              {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Security Standard</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Argon2id + HS256 Token
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Role Permissions Matrix</h3>
          <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1 text-slate-600">
            {user?.role === 'CLOSING_AGENT' || user?.role === 'ADMIN' ? (
              <>
                <p>✓ Authorized to create and manage residential closing files</p>
                <p>✓ Authorized to upload, download, and delete title documents</p>
                <p>✓ Authorized to inspect, edit, and verify AI structured extractions</p>
                <p>✓ Authorized to resolve preliminary title exceptions & encumbrance flags</p>
              </>
            ) : (
              <>
                <p>✓ Authorized to view assigned real estate transactions</p>
                <p>✓ Authorized to download permitted closing documents</p>
                <p>✓ Authorized to monitor closing workflow progress</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
