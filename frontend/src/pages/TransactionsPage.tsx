import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  ArrowUpRight, 
  Building2, 
  ShieldAlert, 
  Files, 
  Calendar, 
  DollarSign, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction, TransactionStatus, Property, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [propertyMode, setPropertyMode] = useState<'existing' | 'new'>('existing');
  
  const [formData, setFormData] = useState({
    property_id: '',
    // Inline property fields
    address_line1: '',
    city: '',
    state: 'OR',
    postal_code: '',
    property_type: 'SINGLE_FAMILY',
    apn_pin: '',
    // Transaction fields
    buyer_id: '',
    seller_id: '',
    purchase_price: '',
    earnest_money_deposit: '',
    escrow_account_number: '',
    estimated_closing_date: '',
    notes: '',
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (search) params.search = search;
      const data = await api.getTransactions(params);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, selectedStatus]);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') {
      api.getProperties().then(setProperties).catch(() => {});
      api.getUsers().then(setUsersList).catch(() => {});
    }
  }, [user]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setModalLoading(true);
    try {
      const payload: any = {
        buyer_id: formData.buyer_id || undefined,
        seller_id: formData.seller_id || undefined,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        earnest_money_deposit: formData.earnest_money_deposit ? parseFloat(formData.earnest_money_deposit) : undefined,
        escrow_account_number: formData.escrow_account_number || undefined,
        estimated_closing_date: formData.estimated_closing_date || undefined,
        notes: formData.notes || undefined,
      };

      if (propertyMode === 'existing') {
        if (!formData.property_id) throw new Error('Please select an existing property');
        payload.property_id = formData.property_id;
      } else {
        if (!formData.address_line1 || !formData.city || !formData.postal_code) {
          throw new Error('Please enter complete property address');
        }
        payload.address_line1 = formData.address_line1;
        payload.city = formData.city;
        payload.state = formData.state;
        payload.postal_code = formData.postal_code;
        payload.property_type = formData.property_type;
        payload.apn_pin = formData.apn_pin || undefined;
      }

      await api.createTransaction(payload);
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create transaction');
    } finally {
      setModalLoading(false);
    }
  };

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

  const statuses = ['ALL', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'READY_FOR_CLOSING', 'COMPLETED', 'ON_HOLD'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Closing Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage residential real estate files, track closing stages, and review automated document analysis.
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs shadow-sky-600/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Open New Closing
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === st
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Transaction #, Address, City, or APN..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500">Retrieving closing files...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No transactions found</h3>
            <p className="mt-1 text-xs text-slate-500">There are no closing transactions matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Property Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Parties</th>
                  <th className="py-3 px-4">Price & Escrow</th>
                  <th className="py-3 px-4">Est. Closing</th>
                  <th className="py-3 px-4">Docs / Risks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-sky-700">
                      <Link to={`/transactions/${txn.id}`} className="hover:underline">
                        {txn.transaction_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <span className="font-semibold text-slate-900 block truncate">
                        {txn.property.address_line1}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {txn.property.city}, {txn.property.state} • APN: {txn.property.apn_pin || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(txn.status)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] space-y-0.5">
                      <div className="truncate">
                        <span className="text-slate-400">Buyer:</span>{' '}
                        <span className="font-medium text-slate-800">{txn.buyer?.full_name || 'Unassigned'}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-400">Seller:</span>{' '}
                        <span className="font-medium text-slate-800">{txn.seller?.full_name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 font-mono">
                        {txn.purchase_price ? `$${txn.purchase_price.toLocaleString()}` : '—'}
                      </div>
                      {txn.earnest_money_deposit && (
                        <div className="text-[10px] text-emerald-700 font-mono">
                          Dep: ${txn.earnest_money_deposit.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {txn.estimated_closing_date || 'TBD'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <Files className="w-3 h-3 text-slate-400" />
                          {txn.document_count ?? 0}
                        </span>
                        {(txn.risk_finding_count ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            {txn.risk_finding_count}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/transactions/${txn.id}`}
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        Manage <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Initiate Closing Transaction</h2>
                <p className="text-xs text-slate-500">Create a centralized residential title & escrow file</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTransaction} className="mt-4 space-y-4">
              {/* Property Choice Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Property Association</label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPropertyMode('existing')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-semibold border ${
                      propertyMode === 'existing'
                        ? 'bg-sky-50 border-sky-400 text-sky-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Select Existing Property
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyMode('new')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-semibold border ${
                      propertyMode === 'new'
                        ? 'bg-sky-50 border-sky-400 text-sky-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Enter New Property
                  </button>
                </div>
              </div>

              {propertyMode === 'existing' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Select Registered Property *</label>
                  <select
                    required
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Choose a property --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.address_line1}, {p.city}, {p.state} ({p.apn_pin || 'No APN'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      placeholder="123 Oak Street"
                      className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1 block w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="mt-1 block w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase">Zip *</label>
                      <input
                        type="text"
                        required
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="mt-1 block w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase">APN / Parcel ID</label>
                    <input
                      type="text"
                      value={formData.apn_pin}
                      onChange={(e) => setFormData({ ...formData, apn_pin: e.target.value })}
                      placeholder="e.g. 042-881-992-01"
                      className="mt-1 block w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Parties Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Buyer</label>
                  <select
                    value={formData.buyer_id}
                    onChange={(e) => setFormData({ ...formData, buyer_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="">-- Select Buyer User --</option>
                    {usersList.filter((u) => u.role === 'BUYER').map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Seller</label>
                  <select
                    value={formData.seller_id}
                    onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="">-- Select Seller User --</option>
                    {usersList.filter((u) => u.role === 'SELLER').map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financials & Closing Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Purchase Price ($)</label>
                  <input
                    type="number"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="485000"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Earnest Deposit ($)</label>
                  <input
                    type="number"
                    value={formData.earnest_money_deposit}
                    onChange={(e) => setFormData({ ...formData, earnest_money_deposit: e.target.value })}
                    placeholder="15000"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Escrow Reference #</label>
                  <input
                    type="text"
                    value={formData.escrow_account_number}
                    onChange={(e) => setFormData({ ...formData, escrow_account_number: e.target.value })}
                    placeholder="ESC-2026-CHASE"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Est. Closing Date</label>
                  <input
                    type="date"
                    value={formData.estimated_closing_date}
                    onChange={(e) => setFormData({ ...formData, estimated_closing_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Closing Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes on contingencies, loan requirements..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {modalLoading ? 'Creating...' : 'Initialize Closing File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
