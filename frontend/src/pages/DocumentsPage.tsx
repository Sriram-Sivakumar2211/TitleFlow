import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Files, FileText, Download, Sparkles, CheckCircle2, Clock, Search, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { Transaction, DocumentRecord } from '../types';

export const DocumentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const txns = await api.getTransactions();
        setTransactions(txns);

        // Fetch docs for all transactions
        const docsPromises = txns.map((t) => api.getTransactionDocuments(t.id));
        const allDocsArrays = await Promise.all(docsPromises);
        setDocuments(allDocsArrays.flat());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter((d) =>
    d.original_filename.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Document Repository</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Centralized secure storage for real estate deeds, title reports, purchase agreements, and mortgages.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by filename or category..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-xs text-slate-500">Scanning document repositories...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-16 text-center">
            <Files className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No documents found</h3>
            <p className="mt-1 text-xs text-slate-500">Upload documents inside any transaction file to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">AI Extraction</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="truncate max-w-[250px]">{doc.original_filename}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded">
                        {doc.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {doc.processing_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {(doc.file_size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/transactions/${doc.transaction_id}`}
                          className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                        >
                          View File <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <a
                          href={api.getDocumentDownloadUrl(doc.id)}
                          download={doc.original_filename}
                          className="p-1 text-slate-500 hover:text-slate-800"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
