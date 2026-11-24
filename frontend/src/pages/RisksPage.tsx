import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Info, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Transaction, RiskFinding, RiskSeverity } from '../types';

export const RisksPage: React.FC = () => {
  const [findings, setFindings] = useState<{ finding: RiskFinding; transactionNumber: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  useEffect(() => {
    const fetchAllRisks = async () => {
      try {
        setLoading(true);
        const txns = await api.getTransactions();
        const allFindingsPromises = txns.map(async (t) => {
          const rList = await api.getTransactionRisks(t.id);
          return rList.map((f) => ({ finding: f, transactionNumber: t.transaction_number }));
        });
        const nested = await Promise.all(allFindingsPromises);
        setFindings(nested.flat());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRisks();
  }, []);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'HIGH_PRIORITY_REVIEW':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">HIGH PRIORITY</span>;
      case 'POTENTIAL_INCONSISTENCY':
        return <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">INCONSISTENCY</span>;
      case 'NEEDS_REVIEW':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">NEEDS REVIEW</span>;
      default:
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">NOTICE</span>;
    }
  };

  const filtered = findings.filter((item) =>
    filterSeverity === 'ALL' ? true : item.finding.severity === filterSeverity
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Title Risk Review Console</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Preliminary AI-assisted inconsistency identification across all open closing files.
        </p>
      </div>

      {/* Title Disclaimer Alert */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold">Preliminary Title Risk Review Notice</p>
          <p className="leading-relaxed text-amber-800">
            This module provides preliminary automated issue detection. It does <strong>NOT</strong> constitute a legally binding title opinion, title guarantee, or insurance endorsement. Closing officers must verify all legal deeds, encumbrances, and exceptions with official county recorders.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex gap-2">
        {['ALL', 'HIGH_PRIORITY_REVIEW', 'POTENTIAL_INCONSISTENCY', 'NEEDS_REVIEW', 'INFORMATIONAL'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterSeverity === sev
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {sev.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Findings List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500">Evaluating risks across closing files...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No title risk findings found</h3>
            <p className="mt-1 text-xs text-slate-500">All closing files pass standard preliminary verification.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ finding, transactionNumber }) => (
              <div 
                key={finding.id}
                className={`p-4 rounded-xl border transition-all ${
                  finding.review_status === 'RESOLVED' 
                    ? 'bg-slate-50 opacity-75' 
                    : finding.severity === 'HIGH_PRIORITY_REVIEW'
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(finding.severity)}
                      <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {transactionNumber}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{finding.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        finding.review_status === 'RESOLVED' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {finding.review_status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mt-1">
                      {finding.description}
                    </p>
                    <p className="text-[11px] text-slate-500 italic">
                      <span className="font-semibold text-slate-600">Rationale:</span> {finding.reason}
                    </p>
                    {finding.resolution_notes && (
                      <div className="mt-2 text-xs bg-emerald-50 text-emerald-900 p-2 rounded border border-emerald-200">
                        <span className="font-semibold">Resolution:</span> {finding.resolution_notes}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/transactions/${finding.transaction_id}`}
                    className="shrink-0 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    Manage in File <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
