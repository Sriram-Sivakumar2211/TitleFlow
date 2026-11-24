import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  ShieldAlert, 
  LayoutDashboard, 
  Files, 
  User as UserIcon, 
  LogOut, 
  Search, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: FileText },
    { label: 'Properties', path: '/properties', icon: Building2 },
    { label: 'All Documents', path: '/documents', icon: Files },
    { label: 'Title Risk Review', path: '/risks', icon: ShieldAlert },
    { label: 'Account Profile', path: '/profile', icon: UserIcon },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-semibold">Admin</span>;
      case 'CLOSING_AGENT':
        return <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full font-semibold">Closing Agent</span>;
      case 'BUYER':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold">Buyer</span>;
      case 'SELLER':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">Seller</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                TitleFlow
                <span className="text-[10px] bg-sky-500/20 text-sky-400 font-mono font-medium px-1.5 py-0.5 rounded">v1.0</span>
              </span>
              <p className="text-[11px] text-slate-400 font-normal">Digital Title & Escrow</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI & Escrow Badge banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-800/60 border border-slate-750 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="text-xs">
            <p className="text-white font-medium">AI Document Engine</p>
            <p className="text-slate-400 text-[11px]">Active (Fallback / Rule mode)</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-sky-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-200" />}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 text-xs font-semibold shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">Environment:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Local Secure Development
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Argon2 + JWT Session Protected</span>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-slate-800">{user?.full_name}</p>
              <p className="text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
