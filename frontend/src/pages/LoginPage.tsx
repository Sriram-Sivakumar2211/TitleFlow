import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('agent.sarah@titleflow.com');
  const [password, setPassword] = useState('AgentPass123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setSampleUser = (sampleEmail: string, samplePass: string) => {
    setEmail(sampleEmail);
    setPassword(samplePass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          TitleFlow Infrastructure
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Digital Title & Escrow Closing Infrastructure
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3.5 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@titleflow.com"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Closing Portal
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Switcher for Test Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wider text-center">
              Quick Test Accounts (Click to Fill)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSampleUser('agent.sarah@titleflow.com', 'AgentPass123!')}
                className="p-2 text-left rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
              >
                <span className="font-semibold text-sky-900 block">Closing Agent</span>
                <span className="text-sky-700 text-[10px]">agent.sarah@titleflow.com</span>
              </button>

              <button
                type="button"
                onClick={() => setSampleUser('admin@titleflow.com', 'AdminPass123!')}
                className="p-2 text-left rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                <span className="font-semibold text-purple-900 block">Platform Admin</span>
                <span className="text-purple-700 text-[10px]">admin@titleflow.com</span>
              </button>

              <button
                type="button"
                onClick={() => setSampleUser('buyer.john@example.com', 'BuyerPass123!')}
                className="p-2 text-left rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <span className="font-semibold text-emerald-900 block">Buyer</span>
                <span className="text-emerald-700 text-[10px]">buyer.john@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => setSampleUser('seller.robert@example.com', 'SellerPass123!')}
                className="p-2 text-left rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <span className="font-semibold text-amber-900 block">Seller</span>
                <span className="text-amber-700 text-[10px]">seller.robert@example.com</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <span className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-500">
                Register new account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
