import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowUpRight, 
  Plus, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_CLOSING':
      case 'COMPLETED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">{status.replace(/_/g, ' ')}</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-medium">{status.replace(/_/g, ' ')}</span>;
      case 'DOCUMENTS_PENDING':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2.5 py-0.5 rounded-full font-medium">{status.replace(/_/g, ' ')}</span>;
      case 'ON_HOLD':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-medium">{status.replace(/_/g, ' ')}</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">{status.replace(/_/g, ' ')}</span>;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-slate-500 font-medium">Loading live title & escrow pipeline data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Closing Operations Dashboard
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-semibold px-2 py-0.5 rounded-md">Live</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.full_name}</span>. Here is the operational summary of your active real estate closings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            title="Refresh Metrics"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {(user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') && (
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs shadow-sky-600/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Closing File
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Transactions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Closings</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.active_transactions ?? 0}</span>
            <span className="text-xs text-slate-500 font-medium">in progress</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Awaiting Review:</span>
            <span className="font-semibold text-amber-600">{stats?.transactions_awaiting_review ?? 0}</span>
          </div>
        </div>

        {/* Card 2: Documents Processed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Docs Processed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.documents_processed ?? 0}</span>
            <span className="text-xs text-emerald-600 font-medium">extracted</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pending Queue:</span>
            <span className="font-semibold text-slate-700">{stats?.pending_documents ?? 0}</span>
          </div>
        </div>

        {/* Card 3: Total Properties */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Property Parcels</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.total_properties ?? 0}</span>
            <span className="text-xs text-slate-500 font-medium">registered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>APN Verified:</span>
            <span className="font-semibold text-purple-700">100% indexed</span>
          </div>
        </div>

        {/* Card 4: High Priority Title Risks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Preliminary Title Flags</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              (stats?.high_priority_risks_count ?? 0) > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${(stats?.high_priority_risks_count ?? 0) > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {stats?.high_priority_risks_count ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">high priority flags</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/risks" className="text-sky-600 font-semibold hover:underline flex items-center gap-1">
              Review findings <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Status Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown Chart Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            Closing Pipeline Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-1">Status breakdown of all closing files</p>

          <div className="mt-5 space-y-3.5">
            {stats && Object.entries(stats.status_breakdown).map(([statusKey, count]) => {
              const total = stats.active_transactions + (stats.status_breakdown['COMPLETED'] || 0) || 1;
              const percentage = Math.min(100, Math.round((count / total) * 100));
              return (
                <div key={statusKey} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{statusKey.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500 font-mono">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        statusKey === 'READY_FOR_CLOSING' ? 'bg-emerald-500' :
                        statusKey === 'UNDER_REVIEW' ? 'bg-amber-500' :
                        statusKey === 'COMPLETED' ? 'bg-blue-500' :
                        statusKey === 'ON_HOLD' ? 'bg-rose-500' : 'bg-sky-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-sky-50/50 p-3 rounded-lg border border-sky-100">
            <div className="flex items-start gap-2 text-xs text-sky-900">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">AI Extraction Engine</p>
                <p className="text-[11px] text-sky-800/80 mt-0.5">
                  Uploaded deeds and title reports are automatically indexed for APN, legal descriptions, and lien clauses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Active Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time settlement status from database</p>
            </div>
            <Link to="/transactions" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-medium uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Transaction #</th>
                  <th className="py-2.5 px-3">Property</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Closing Date</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
                  stats.recent_transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-sky-700">
                        {txn.transaction_number}
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate">
                        <span className="font-semibold text-slate-900 block truncate">{txn.property.address_line1}</span>
                        <span className="text-[11px] text-slate-500">{txn.property.city}, {txn.property.state}</span>
                      </td>
                      <td className="py-3 px-3">
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {txn.estimated_closing_date || 'TBD'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                        {txn.purchase_price ? `$${txn.purchase_price.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link 
                          to={`/transactions/${txn.id}`}
                          className="font-semibold text-sky-600 hover:text-sky-800 hover:underline"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No active transactions found in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Log */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-500" />
          Recent Transaction Audit Trail & Security Events
        </h2>

        <div className="space-y-3">
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            stats.recent_activity.map((act) => (
              <div key={act.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <div>
                    <span className="font-semibold text-slate-800">{act.description}</span>
                    <span className="text-slate-400 text-[11px] ml-2">by {act.user_name || 'System'}</span>
                  </div>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{act.timestamp}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
