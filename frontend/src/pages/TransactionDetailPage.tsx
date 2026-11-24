import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  User, 
  Upload, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  Trash2, 
  X, 
  Calendar, 
  DollarSign, 
  FileCheck, 
  ArrowLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { 
  Transaction, 
  DocumentRecord, 
  RiskFinding, 
  DocumentCategory, 
  TransactionStatus,
  ExtractedFieldItem 
} from '../types';
import { useAuth } from '../contexts/AuthContext';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [risks, setRisks] = useState<RiskFinding[]>([]);
  const [activeTab, setActiveTab] = useState<'documents' | 'risks' | 'details'>('documents');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('PROPERTY_DEED');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Extraction Inspection Modal State
  const [inspectDoc, setInspectDoc] = useState<DocumentRecord | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Risk Resolution Modal State
  const [resolvingFinding, setResolvingFinding] = useState<RiskFinding | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<string>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolvingLoading, setResolvingLoading] = useState(false);

  const loadAll = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [tData, dData, rData] = await Promise.all([
        api.getTransaction(id),
        api.getTransactionDocuments(id),
        api.getTransactionRisks(id),
      ]);
      setTransaction(tData);
      setDocuments(dData);
      setRisks(rData);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleStatusChange = async (newStatus: TransactionStatus) => {
    if (!id || !transaction) return;
    try {
      const updated = await api.updateTransaction(id, { status: newStatus });
      setTransaction(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update transaction status');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !id) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('transaction_id', id);
      formData.append('category', uploadCategory);
      formData.append('file', uploadFile);

      await api.uploadDocument(formData);
      setUploadModalOpen(false);
      setUploadFile(null);
      await loadAll();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (docId: string) => {
    try {
      await api.reprocessDocument(docId);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Reprocessing failed');
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document from the closing record?')) return;
    try {
      await api.deleteDocument(docId);
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleVerifyExtraction = async () => {
    if (!inspectDoc) return;
    setVerifying(true);
    try {
      await api.verifyExtraction(inspectDoc.id, { is_verified: true });
      await loadAll();
      setInspectDoc(null);
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveRiskResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingFinding) return;
    setResolvingLoading(true);
    try {
      await api.reviewRiskFinding(resolvingFinding.id, {
        review_status: resolutionStatus,
        resolution_notes: resolutionNotes,
      });
      setResolvingFinding(null);
      setResolutionNotes('');
      await loadAll();
    } catch (err: any) {
      alert(err.message || 'Failed to update risk review status');
    } finally {
      setResolvingLoading(false);
    }
  };

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

  const stages: TransactionStatus[] = [
    'DRAFT',
    'DOCUMENTS_PENDING',
    'UNDER_REVIEW',
    'READY_FOR_CLOSING',
    'COMPLETED'
  ];

  if (loading && !transaction) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading closing transaction file...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="mt-3 text-sm font-semibold text-slate-900">Transaction Not Found</h3>
        <Link to="/transactions" className="mt-2 inline-block text-xs text-sky-600 hover:underline">
          Return to Transactions
        </Link>
      </div>
    );
  }

  const currentStageIndex = stages.indexOf(transaction.status);

  return (
    <div className="space-y-6">
      {/* Back button & Title Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Link to="/transactions" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Closings
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {transaction.transaction_number}
              </h1>
              <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {transaction.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{transaction.property.address_line1}</span>, {transaction.property.city}, {transaction.property.state} {transaction.property.postal_code}
            </p>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') && (
            <div className="flex items-center gap-2.5">
              <select
                value={transaction.status}
                onChange={(e) => handleStatusChange(e.target.value as TransactionStatus)}
                className="text-xs px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white text-slate-700 focus:ring-2 focus:ring-sky-500"
              >
                <option value="DRAFT">Status: Draft</option>
                <option value="DOCUMENTS_PENDING">Status: Documents Pending</option>
                <option value="UNDER_REVIEW">Status: Under Review</option>
                <option value="READY_FOR_CLOSING">Status: Ready For Closing</option>
                <option value="COMPLETED">Status: Completed</option>
                <option value="ON_HOLD">Status: On Hold</option>
              </select>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Document
              </button>
            </div>
          )}
        </div>

        {/* Closing Workflow Stepper */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stages.map((st, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div 
                  key={st}
                  className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                    isCurrent 
                      ? 'bg-sky-50 border-sky-400 font-bold text-sky-900 shadow-xs'
                      : isPast
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className={`w-3.5 h-3.5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isCurrent ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">{st.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('documents')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Closing Documents ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'risks'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Title Risk Review ({risks.length})
          {risks.some(r => r.severity === 'HIGH_PRIORITY_REVIEW' && r.review_status !== 'RESOLVED') && (
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'details'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Property & Parties
        </button>
      </div>

      {/* Tab 1: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-b-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Closing Documentation File</h2>
              <p className="text-xs text-slate-500">
                Uploaded deeds, commitments, and agreements processed through the AI extraction pipeline.
              </p>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
            >
              <Upload className="w-3.5 h-3.5" />
              Add Document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center">
              <Upload className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 mt-2">No documents attached yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Upload a PDF Deed, Title Report, or Purchase Agreement</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="mt-3 px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-lg"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">AI Extraction Status</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Uploaded</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {documents.map((doc) => {
                    const hasExtraction = !!doc.extraction_result;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                            <span className="truncate max-w-[220px]">{doc.original_filename}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded">
                            {doc.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {doc.processing_status === 'PROCESSED' ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Processed
                              </span>
                            ) : doc.processing_status === 'NEEDS_REVIEW' ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" /> Low Confidence (Review)
                              </span>
                            ) : doc.processing_status === 'PROCESSING' ? (
                              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Extracting...
                              </span>
                            ) : (
                              <span className="bg-red-50 text-red-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                                Failed
                              </span>
                            )}
                            {doc.ocr_applied && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">OCR</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {(doc.file_size_bytes / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasExtraction && (
                              <button
                                onClick={() => setInspectDoc(doc)}
                                className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded text-xs font-semibold flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3 text-sky-600" />
                                Inspect AI
                              </button>
                            )}

                            <a
                              href={api.getDocumentDownloadUrl(doc.id)}
                              download={doc.original_filename}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            {(user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') && (
                              <>
                                <button
                                  onClick={() => handleReprocess(doc.id)}
                                  className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded"
                                  title="Reprocess with AI Engine"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Title Risk Review */}
      {activeTab === 'risks' && (
        <div className="bg-white rounded-b-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          {/* Regulatory & Title Disclaimer Warning */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">Preliminary Title Review Advisory</p>
              <p className="leading-relaxed text-amber-800">
                This automated title analysis is an AI-assisted inconsistency identification tool for escrow and closing officers.
                It is <strong>NOT</strong> a legally certified title search, title commitment, or title insurance underwriting approval.
                All legal encumbrances, deed restrictions, and conveyances require review by a licensed title professional.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Identified Preliminary Title Findings</h2>
              <p className="text-xs text-slate-500">Cross-document inconsistency detection, missing records, and potential liens</p>
            </div>

            <button
              onClick={async () => {
                if (!id) return;
                await api.evaluateTransactionRisks(id);
                await loadAll();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-evaluate All Risks
            </button>
          </div>

          {risks.length === 0 ? (
            <div className="py-12 border rounded-xl text-center text-slate-500 bg-slate-50">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-800 mt-2">No title inconsistencies detected</p>
              <p className="text-[11px] text-slate-400">All uploaded documents and property records align with baseline standards.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {risks.map((risk) => (
                <div 
                  key={risk.id}
                  className={`p-4 rounded-xl border transition-all ${
                    risk.review_status === 'RESOLVED' 
                      ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                      : risk.severity === 'HIGH_PRIORITY_REVIEW'
                      ? 'bg-red-50/40 border-red-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(risk.severity)}
                        <h3 className="text-xs font-bold text-slate-900">{risk.title}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          risk.review_status === 'RESOLVED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {risk.review_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed mt-1">
                        {risk.description}
                      </p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        <span className="font-semibold text-slate-600">Rationale:</span> {risk.reason}
                      </p>
                      {risk.resolution_notes && (
                        <div className="mt-2 text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200">
                          <span className="font-semibold">Resolution Note:</span> {risk.resolution_notes}
                        </div>
                      )}
                    </div>

                    {(user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') && (
                      <button
                        onClick={() => {
                          setResolvingFinding(risk);
                          setResolutionStatus(risk.review_status === 'RESOLVED' ? 'OPEN' : 'RESOLVED');
                          setResolutionNotes(risk.resolution_notes || '');
                        }}
                        className="shrink-0 px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        {risk.review_status === 'RESOLVED' ? 'Edit Resolution' : 'Review & Resolve'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Property & Parties */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-b-xl border border-slate-200/80 shadow-xs p-6">
          {/* Property Master Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              Property Master Record
            </h2>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Street Address</span>
                <span className="font-bold text-slate-900 text-sm">{transaction.property.address_line1}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">City</span>
                  <span className="font-medium text-slate-800">{transaction.property.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">State</span>
                  <span className="font-medium text-slate-800">{transaction.property.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Zip Code</span>
                  <span className="font-medium text-slate-800">{transaction.property.postal_code}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assessor's Parcel Number (APN / PIN)</span>
                <span className="font-mono font-bold text-sky-800">{transaction.property.apn_pin || 'Not on file'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Legal Description</span>
                <p className="text-slate-700 italic">{transaction.property.legal_description || 'None provided'}</p>
              </div>
            </div>
          </div>

          {/* Parties & Escrow Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-4 h-4 text-sky-600" />
              Closing Parties & Settlement
            </h2>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Buyer (Grantee)</span>
                <span className="font-bold text-slate-900">{transaction.buyer?.full_name || 'Unassigned'}</span>
                <span className="text-slate-500 block text-[11px]">{transaction.buyer?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Seller (Grantor)</span>
                <span className="font-bold text-slate-900">{transaction.seller?.full_name || 'Unassigned'}</span>
                <span className="text-slate-500 block text-[11px]">{transaction.seller?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Closing Agent</span>
                <span className="font-bold text-slate-900">{transaction.closing_agent?.full_name || 'Unassigned'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purchase Consideration</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {transaction.purchase_price ? `$${transaction.purchase_price.toLocaleString()}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Earnest Money Deposit</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {transaction.earnest_money_deposit ? `$${transaction.earnest_money_deposit.toLocaleString()}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Upload Closing Document</h2>
              <button onClick={() => setUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="PROPERTY_DEED">Property Deed (Warranty / Grant)</option>
                  <option value="TITLE_REPORT">Title Report / Commitment</option>
                  <option value="PURCHASE_AGREEMENT">Purchase & Sale Agreement</option>
                  <option value="MORTGAGE_DOCUMENT">Mortgage / Deed of Trust</option>
                  <option value="LIEN_DOCUMENT">Lien / Encumbrance Notice</option>
                  <option value="TAX_RECORD">Property Tax Assessment</option>
                  <option value="OTHER">Other Closing Record</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Select File (PDF, PNG, JPG, TIFF)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,.tiff"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              <div className="bg-sky-50/70 p-3 rounded-lg border border-sky-100 text-xs text-sky-900">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Automated Pipeline
                </div>
                <p className="text-[11px] text-sky-800 mt-0.5">
                  Upon upload, the AI engine extracts text, checks for APN and address consistency, and updates risk flags.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Processing AI Pipeline...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Extraction Inspector Modal */}
      {inspectDoc && inspectDoc.extraction_result && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">AI Structured Extraction Inspector</h2>
                  <p className="text-xs text-slate-500 font-mono">{inspectDoc.original_filename}</p>
                </div>
              </div>
              <button onClick={() => setInspectDoc(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {Object.entries(inspectDoc.extraction_result.extracted_data).map(([fieldKey, fieldVal]) => {
                if (typeof fieldVal !== 'object' || fieldVal === null) return null;
                const item = fieldVal as ExtractedFieldItem;
                const hasValue = item.value !== null && item.value !== undefined;
                return (
                  <div key={fieldKey} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                        {fieldKey.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.source_page && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Page {item.source_page}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.confidence >= 0.85 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.confidence > 0 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {(item.confidence * 100).toFixed(0)}% Confidence
                        </span>
                      </div>
                    </div>
                    <div className="font-medium text-slate-900">
                      {hasValue ? String(item.value) : <span className="text-slate-400 italic">Not found in document</span>}
                    </div>
                    {item.source_text_snippet && (
                      <p className="mt-1 text-[11px] text-slate-500 font-mono bg-white p-1.5 rounded border border-slate-150 truncate">
                        Match snippet: "{item.source_text_snippet}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Status: {inspectDoc.extraction_result.is_verified ? (
                  <span className="text-emerald-700 font-semibold">Verified by Closing Officer</span>
                ) : (
                  <span className="text-amber-700 font-semibold">Unverified (Automated Extraction)</span>
                )}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInspectDoc(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                {(user?.role === 'ADMIN' || user?.role === 'CLOSING_AGENT') && (
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={handleVerifyExtraction}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {inspectDoc.extraction_result.is_verified ? 'Re-Verify Fields' : 'Verify & Mark Approved'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review & Resolve Risk Finding Modal */}
      {resolvingFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Resolve Title Finding</h2>
              <button onClick={() => setResolvingFinding(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRiskResolution} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Finding:</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{resolvingFinding.title}</p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                  {resolvingFinding.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Review Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="RESOLVED">Resolved (Cured / Satisfied in Escrow)</option>
                  <option value="ACKNOWLEDGED">Acknowledged (Acceptable Title Exception)</option>
                  <option value="DISMISSED">Dismissed (False Positive / Superseded)</option>
                  <option value="OPEN">Keep Open (Under Investigation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Settlement / Legal Notes</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document the resolution rationale, payoff verification, or title agent approval..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResolvingFinding(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolvingLoading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {resolvingLoading ? 'Saving...' : 'Update Review Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
