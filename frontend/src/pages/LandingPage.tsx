import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Workflow, 
  Users, 
  FileCheck, 
  Building2, 
  AlertTriangle,
  History,
  PenTool,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { LandingNavbar } from '../components/LandingNavbar';
import { HeroDashboardPreview } from '../components/HeroDashboardPreview';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden border-b border-slate-900">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[300px] bg-teal-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-teal-400" />
            <span className="font-medium text-slate-200">TitleFlow 2.0 Enterprise Release</span>
            <span className="text-slate-500">•</span>
            <span className="text-sky-400 font-semibold">Autonomous Title Operations</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Real Estate Closings. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300">
              Reimagined.
            </span>
          </h1>

          {/* Supporting Paragraph */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            One secure platform to manage title reviews, property documents, escrow workflows, and closing operations — from the first document to the final signature.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition shadow-lg shadow-sky-600/25 active:scale-[0.99]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#platform"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold rounded-xl bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white transition border border-slate-800"
            >
              <span>Explore the Platform</span>
            </a>
          </div>

          {/* Hero Realistic Application Screenshot / UI Composition */}
          <div className="pt-8 sm:pt-12">
            <HeroDashboardPreview />
          </div>
        </div>
      </section>

      {/* Trust / Core Value Proposition */}
      <section className="py-16 md:py-24 bg-slate-900/50 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-sky-400">
              Centralized Infrastructure
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Everything your closing team needs. All in one place.
            </p>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Designed specifically for title companies, escrow officers, attorneys, and lenders who demand accuracy, security, and velocity.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Centralized Operations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consolidate properties, escrow files, earnest money tracking, and closing timelines inside a unified workspace.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Better Document Visibility</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant full-text OCR indexing, classification, and structured data extraction across deeds, title commitments, and contracts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Reduced Manual Coordination</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect buyers, sellers, and closing officers with role-specific views, automated task progression, and milestone alerts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Secure Transaction Workflows</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based access permissions, audit logging, and payment instruction verification to defend against fraud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="platform" className="py-20 md:py-28 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Purpose-built tools for modern closing teams
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Engineered to replace fragmented email threads and manual spreadsheets with dependable automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 transition space-y-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI-Assisted Title Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extract parcel APNs, legal descriptions, seller vesting, and preliminary liens with multi-pass OCR and LLM analysis. Flag critical discrepancies early in the closing timeline.
              </p>
              <div className="pt-2 text-xs font-medium text-purple-400 flex items-center gap-1">
                <span>Deterministic fallback included</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 transition space-y-4">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Secure Document Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized cloud storage supporting deeds, purchase agreements, tax certificates, and escrow receipts. Granular permission gating ensures sensitive contracts remain protected.
              </p>
              <div className="pt-2 text-xs font-medium text-sky-400 flex items-center gap-1">
                <span>S3 & local storage abstraction</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 transition space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Escrow Workflow Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track each escrow milestone from draft creation through earnest money verification and title clearance. Automated statuses keep all transaction stakeholders aligned.
              </p>
              <div className="pt-2 text-xs font-medium text-teal-400 flex items-center gap-1">
                <span>Customizable closing checklists</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 transition space-y-4">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Wire Fraud Defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flag suspicious payment instruction modifications and unverified disbursement requests. Require multi-officer confirmation before any wire transfer instructions are finalized.
              </p>
              <div className="pt-2 text-xs font-medium text-rose-400 flex items-center gap-1">
                <span>Disbursement verification engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 transition space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Remote Online Notarization (RON)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Architecture designed for provider-assisted remote online notarization. Coordinate signer identification, digital seal validation, and tamper-evident document bundling.
              </p>
              <div className="pt-2 text-xs font-medium text-amber-400 flex items-center gap-1">
                <span>Provider-ready interface</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 transition space-y-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Complete Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every login, document review, risk finding status change, and transaction edit is captured with IP address, user identity, and ISO timestamps for comprehensive regulatory readiness.
              </p>
              <div className="pt-2 text-xs font-medium text-indigo-400 flex items-center gap-1">
                <span>Immutable activity timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Workflow Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              How TitleFlow simplifies closings
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              From workspace setup to the final funding disbursement, coordinate every milestone seamlessly.
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="text-2xl font-mono font-bold text-sky-400">01</div>
              <h3 className="text-base font-semibold text-white uppercase tracking-wider">
                Create Your Workspace
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set up your organization's verified tenant, designate admin privileges, and invite closing team members.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="text-2xl font-mono font-bold text-sky-400">02</div>
              <h3 className="text-base font-semibold text-white uppercase tracking-wider">
                Add Your Transactions
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create property records, associate buyers and sellers, and assign closing agents with unique escrow tracking codes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="text-2xl font-mono font-bold text-sky-400">03</div>
              <h3 className="text-base font-semibold text-white uppercase tracking-wider">
                Review and Coordinate
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload closing files for automatic AI extraction, inspect preliminary risk findings, and resolve title discrepancies.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="text-2xl font-mono font-bold text-sky-400">04</div>
              <h3 className="text-base font-semibold text-white uppercase tracking-wider">
                Complete the Closing
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coordinate final approvals, verify wire instructions, notarize execution documents, and generate the final audit bundle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 md:py-28 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Enterprise Security Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Built for transactions where trust matters.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Real estate closings involve significant capital transfers and highly confidential records. TitleFlow enforces strict structural safeguards throughout every interaction.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Controlled Document Access</h4>
                    <p className="text-xs text-slate-400">Multi-tenant workspace isolation with scoped document permissions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Role-Based Access Control (RBAC)</h4>
                    <p className="text-xs text-slate-400">Distinct authorization levels for Admin, Closing Agent, Buyer, and Seller roles.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Secure Authentication</h4>
                    <p className="text-xs text-slate-400">Argon2id password hashing and signed JWT sessions with secure cookie handling.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Payment Instruction Verification</h4>
                    <p className="text-xs text-slate-400">Workflows engineered to detect unauthorized escrow account modifications.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Visual Card */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Controls Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">Active</span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-medium text-slate-200">Cryptographic Password Hashing</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Argon2id</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-medium text-slate-200">Session Security</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">JWT / HS256</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-slate-200">File Storage Integrity</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">MIME Validated</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-slate-200">Audit Logging</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Immutable JSONB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Audience Grid */}
      <section id="solutions" className="py-20 md:py-24 bg-slate-900/30 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Industry Solutions
            </span>
            <h2 className="text-3xl font-bold text-white">
              Tailored for every real estate closing stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-base font-semibold text-white">Title & Escrow Agencies</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Process higher closing volumes with automated title commitment reviews, defect triage, and automated document package validation.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-base font-semibold text-white">Real Estate Attorneys</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identify boundary discrepancies, unreleased encumbrances, and probate vesting inconsistencies with comprehensive audit trails.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-base font-semibold text-white">Lenders & Mortgage Officers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accelerate loan closing package clearance and gain real-time visibility into escrow condition satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Bring clarity to every closing.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Give your team a more organized, transparent way to manage residential real estate transactions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition shadow-lg shadow-sky-600/30"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white transition border border-slate-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#platform" className="hover:text-white transition">Platform Overview</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">Workflow Engine</a></li>
                <li><a href="#security" className="hover:text-white transition">Security Architecture</a></li>
                <li><Link to="/signup" className="hover:text-white transition">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="#solutions" className="hover:text-white transition">Title Companies</a></li>
                <li><a href="#solutions" className="hover:text-white transition">Escrow Officers</a></li>
                <li><a href="#solutions" className="hover:text-white transition">Closing Attorneys</a></li>
                <li><a href="#solutions" className="hover:text-white transition">Lending Partners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-white transition">Register Workspace</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition">Active Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Company</h4>
              <ul className="space-y-2">
                <li><span className="text-slate-500">TitleFlow Cloud Infrastructure</span></li>
                <li><span className="text-slate-500">Residential Escrow OS</span></li>
                <li><span className="text-slate-500">Contact: support@titleflow.com</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-300">TitleFlow</span>
              <span className="text-slate-600">© {new Date().getFullYear()} Digital Title & Escrow Closing Infrastructure. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-slate-500">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security Controls</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
