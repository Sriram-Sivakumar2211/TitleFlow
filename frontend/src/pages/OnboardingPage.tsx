import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  User, 
  Building2, 
  Settings, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Briefcase, 
  Globe, 
  MapPin, 
  Users, 
  AlertCircle,
  FileCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationType } from '../types';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  // Step 1: Account Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2: Organization Info
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('TITLE_COMPANY');
  const [website, setWebsite] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 3: Workspace Config
  const [teamSize, setTeamSize] = useState('1-5');
  const [monthlyClosingVolume, setMonthlyClosingVolume] = useState('10-50');
  const [primaryUseCase, setPrimaryUseCase] = useState('Comprehensive Title & Escrow Management');
  const [inviteEmails, setInviteEmails] = useState('');

  // Validation Helpers
  const validateStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim() || !email.includes('@')) return 'Please provide a valid business email.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!termsAccepted) return 'Please accept the terms of service to continue.';
    return null;
  };

  const validateStep2 = () => {
    if (!orgName.trim()) return 'Please enter your company or organization name.';
    if (!state.trim()) return 'Please enter the primary state of operation.';
    return null;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setError(null);
    setLoading(true);

    try {
      const parsedInvites = inviteEmails
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.includes('@'));

      const payload = {
        account: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
          job_title: jobTitle.trim() || undefined,
        },
        organization: {
          name: orgName.trim(),
          org_type: orgType,
          website: website.trim() || undefined,
          business_email: businessEmail.trim().toLowerCase() || email.trim().toLowerCase(),
          phone: orgPhone.trim() || phone.trim() || undefined,
          country: country.trim(),
          state: state.trim() || undefined,
          city: city.trim() || undefined,
          address: address.trim() || undefined,
          postal_code: postalCode.trim() || undefined,
        },
        workspace: {
          team_size: teamSize,
          monthly_closing_volume: monthlyClosingVolume,
          primary_use_case: primaryUseCase,
          invited_team_members: parsedInvites,
        },
      };

      const result = await api.onboard(payload);

      // Save token into localStorage
      localStorage.setItem('titleflow_token', result.access_token);

      // Navigate to onboarding success screen
      navigate('/onboarding/success', {
        state: {
          organizationName: result.organization_name,
          accountHolder: result.full_name,
          orgType: result.org_type,
          userEmail: result.user_email,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Onboarding failed. Please review your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">TitleFlow</span>
          </Link>
          <div className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className={step >= 1 ? 'text-sky-400' : ''}>1. Account</span>
            <span className={step >= 2 ? 'text-sky-400' : ''}>2. Organization</span>
            <span className={step >= 3 ? 'text-sky-400' : ''}>3. Workspace</span>
            <span className={step >= 4 ? 'text-sky-400' : ''}>4. Review</span>
          </div>
          <div className="grid grid-cols-4 gap-2 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className={`h-full transition-all ${step >= 1 ? 'bg-sky-500' : 'bg-slate-800'}`} />
            <div className={`h-full transition-all ${step >= 2 ? 'bg-sky-500' : 'bg-slate-800'}`} />
            <div className={`h-full transition-all ${step >= 3 ? 'bg-sky-500' : 'bg-slate-800'}`} />
            <div className={`h-full transition-all ${step >= 4 ? 'bg-sky-500' : 'bg-slate-800'}`} />
          </div>
        </div>

        {/* Card Frame */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* STEP 1: Account Creation */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Create your primary account</h2>
                <p className="text-sm text-slate-400 mt-1">
                  You will be designated as the workspace owner and principal closing officer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Business Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="sarah@pacifictitle.com"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Direct Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Job Title / Professional Role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      placeholder="Managing Escrow Officer"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded bg-slate-950 border-slate-700 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    I agree to the TitleFlow Terms of Service and acknowledge the confidential treatment of property documents and escrow transactions.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Organization Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Organization Details</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Tell us about your business entity to configure your dedicated agency workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Company / Organization Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      placeholder="Pacific Premier Title & Escrow, LLC"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Organization Type *
                  </label>
                  <select
                    value={orgType}
                    onChange={e => setOrgType(e.target.value as OrganizationType)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="TITLE_COMPANY">Title Company</option>
                    <option value="ESCROW_COMPANY">Escrow Company</option>
                    <option value="LAW_FIRM">Real Estate Law Firm</option>
                    <option value="LENDER">Mortgage Lender</option>
                    <option value="REAL_ESTATE_AGENCY">Real Estate Brokerage</option>
                    <option value="OTHER">Other Professional Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Company Website (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="https://pacifictitle.com"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Primary State of Operation *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="e.g. Oregon, Florida, California"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    City / Municipality
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Portland"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Physical Office Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="1200 SW 5th Ave, Suite 2100"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Workspace Configuration */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Workspace Configuration</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Tune closing throughput and automated document processing for your team.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Expected Closing Team Size
                  </label>
                  <select
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="1-5">1 - 5 Officers & Assistants</option>
                    <option value="6-20">6 - 20 Officers (Growing Agency)</option>
                    <option value="21-50">21 - 50 Officers (Regional Title Firm)</option>
                    <option value="50+">50+ Enterprise Scale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Estimated Monthly Closing Volume
                  </label>
                  <select
                    value={monthlyClosingVolume}
                    onChange={e => setMonthlyClosingVolume(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="1-15">1 - 15 Transactions / Month</option>
                    <option value="16-50">16 - 50 Transactions / Month</option>
                    <option value="51-150">51 - 150 Transactions / Month</option>
                    <option value="150+">150+ High Volume Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Primary Workflow Focus
                  </label>
                  <input
                    type="text"
                    value={primaryUseCase}
                    onChange={e => setPrimaryUseCase(e.target.value)}
                    placeholder="e.g. Residential Title Review & Wire Protection"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Invite Team Members (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={inviteEmails}
                    onChange={e => setInviteEmails(e.target.value)}
                    placeholder="colleague1@pacifictitle.com, escrow.team@pacifictitle.com (comma separated)"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Invited team members can be assigned roles once inside the admin console.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Review and Provision Workspace</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Please verify your information before we initialize your secure cloud closing workspace.
                </p>
              </div>

              <div className="space-y-4">
                {/* Account Summary */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold text-sky-400 tracking-wider">Account Profile</span>
                    <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white underline">Edit</button>
                  </div>
                  <div className="text-sm text-white font-medium">{fullName}</div>
                  <div className="text-xs text-slate-400">{email} {phone ? `• ${phone}` : ''} {jobTitle ? `• ${jobTitle}` : ''}</div>
                </div>

                {/* Organization Summary */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold text-teal-400 tracking-wider">Organization Entity</span>
                    <button onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-white underline">Edit</button>
                  </div>
                  <div className="text-sm text-white font-medium">{orgName}</div>
                  <div className="text-xs text-slate-400">
                    {orgType.replace(/_/g, ' ')} • {city ? `${city}, ` : ''}{state} ({country})
                  </div>
                </div>

                {/* Workspace Summary */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold text-purple-400 tracking-wider">Workspace Parameters</span>
                    <button onClick={() => setStep(3)} className="text-xs text-slate-400 hover:text-white underline">Edit</button>
                  </div>
                  <div className="text-xs text-slate-300">Team Scale: <span className="text-white font-medium">{teamSize}</span></div>
                  <div className="text-xs text-slate-300">Expected Volume: <span className="text-white font-medium">{monthlyClosingVolume} transactions/mo</span></div>
                  <div className="text-xs text-slate-300">Focus: <span className="text-white font-medium">{primaryUseCase}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-500 font-semibold text-sm transition shadow-md shadow-sky-600/30"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white hover:opacity-95 font-semibold text-sm transition shadow-lg shadow-sky-600/30 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Create Workspace</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        TitleFlow Digital Title & Escrow Closing Infrastructure • Enterprise Security Guaranteed
      </footer>
    </div>
  );
};
