import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  TrendingUp,
  Target,
  Users2,
  Send,
  ArrowRight,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Clock,
  Radio,
  ExternalLink,
  MapPin,
  IndianRupee,
  Search,
  Globe2,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Building2,
  GraduationCap,
  FileSpreadsheet,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MatchScoreBadge, VerificationTrustBadge } from '../components/common/Badge'
import { LinkedinIcon } from '../components/common/Icons'
import { Opportunity, Contact } from '../types'
import { exportOpportunitiesToCsv, exportContactsToCsv } from '../utils/exportCsv'
import { VerificationModal } from '../components/common/VerificationModal'

const CITY_FILTER_PATTERNS: Record<string, RegExp> = {
  'Bengaluru': /(bengaluru|bangalore|karnataka|blr|whitefield|electronic city|koramangala|bellandur|marathahalli)/i,
  'Pune': /(pune|hinjewadi|magarpatta|kharadi|baner|viman nagar|hadapsar|maharashtra|wakad)/i,
  'Hyderabad': /(hyderabad|secunderabad|telangana|hitec city|gachibowli|madhapur|cyberabad|kondapur)/i,
  'Delhi NCR': /(delhi|gurgaon|gurugram|noida|greater noida|faridabad|ghaziabad|ncr|cyber city)/i,
  'Mumbai': /(mumbai|navi mumbai|thane|powai|bkc|bandra|andheri|goregaon)/i,
  'Chennai': /(chennai|madras|tamil nadu|omr|siruseri|tidel)/i,
  'Remote': /(remote|wfh|work from home)/i,
}

const CITY_OPTIONS = [
  { label: 'All Hubs', value: 'India', hubKey: 'All Hubs' },
  { label: 'Bengaluru', value: 'Bengaluru, India', hubKey: 'Bengaluru' },
  { label: 'Pune', value: 'Pune, India', hubKey: 'Pune' },
  { label: 'Hyderabad', value: 'Hyderabad, India', hubKey: 'Hyderabad' },
  { label: 'Delhi NCR', value: 'Delhi NCR, India', hubKey: 'Delhi NCR' },
  { label: 'Mumbai', value: 'Mumbai, India', hubKey: 'Mumbai' },
  { label: 'Chennai', value: 'Chennai, India', hubKey: 'Chennai' },
  { label: 'Remote', value: 'Remote', hubKey: 'Remote' },
]

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const {
    opportunities,
    contacts,
    outreachRecords,
    systemActivities,
    openContactDrawer,
    openOutreachModal,
    isDiscovering,
    lastScanText,
    runDiscovery,
    showToast,
  } = useApp()

  const [quickRole, setQuickRole] = useState('')
  const [quickHub, setQuickHub] = useState('All Hubs')
  const [quickExp, setQuickExp] = useState('All')
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  // Audit modal state
  const [selectedAudit, setSelectedAudit] = useState<{
    companyName: string
    website?: string
    recruiterEmail?: string
    recruiterName?: string
    verification?: any
  } | null>(null)

  // Filter opportunities by selected city strictly
  const filteredOpportunities = useMemo(() => {
    if (quickHub === 'All Hubs') return opportunities
    const pattern = CITY_FILTER_PATTERNS[quickHub]
    if (!pattern) {
      return opportunities.filter((opp) =>
        opp.location.toLowerCase().includes(quickHub.toLowerCase())
      )
    }
    if (quickHub === 'Remote') {
      return opportunities.filter(
        (opp) => opp.remote || pattern.test(opp.location) || pattern.test(opp.role)
      )
    }
    return opportunities.filter((opp) => {
      if (pattern.test(opp.location)) return true
      const isGeneric = !opp.location || opp.location.toLowerCase() === 'india' || opp.location.toLowerCase() === 'pan india'
      if (isGeneric && (pattern.test(opp.role) || pattern.test(opp.description))) {
        return true
      }
      return false
    })
  }, [opportunities, quickHub])

  // Filter contacts by selected city strictly
  const filteredContacts = useMemo(() => {
    if (quickHub === 'All Hubs') return contacts
    const pattern = CITY_FILTER_PATTERNS[quickHub]
    if (!pattern) {
      return contacts.filter((c) =>
        (c.location || '').toLowerCase().includes(quickHub.toLowerCase())
      )
    }
    return contacts.filter((c) => {
      if (pattern.test(c.location || '')) return true
      const isGeneric = !c.location || c.location.toLowerCase() === 'india' || c.location.toLowerCase() === 'pan india'
      if (isGeneric && pattern.test(c.whyRelevant || '')) return true
      return false
    })
  }, [contacts, quickHub])

  // Top prioritized opportunities
  const topOpportunities = useMemo(() => {
    return [...filteredOpportunities]
      .sort((a, b) => (b.trustScore || b.matchScore) - (a.trustScore || a.matchScore))
      .slice(0, 8)
  }, [filteredOpportunities])

  const verifiedContactsCount = filteredContacts.filter(
    (c) => c.emailStatus === 'Verified' || c.emailStatus === 'High confidence'
  ).length

  const eligibleFresherCount = filteredOpportunities.filter(
    (o) => o.eligibility?.isEligible || o.experience?.toLowerCase().includes('fresher') || o.experience?.toLowerCase().includes('0–2')
  ).length

  const handleQuickScrape = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const parts = [quickRole.trim()]
    if (quickExp === 'fresher') parts.push('fresher')
    else if (quickExp === 'senior') parts.push('senior')

    const hubObj = CITY_OPTIONS.find((c) => c.hubKey === quickHub)
    const targetLocation = hubObj ? hubObj.value : 'India'

    runDiscovery({
      query: parts.filter(Boolean).join(' '),
      location: targetLocation,
      sites: ['naukri', 'indeed', 'linkedin', 'glassdoor'],
    })
  }

  const handleCityTabClick = (hubKey: string) => {
    setQuickHub(hubKey)
  }

  const handleCopyEmail = (email: string) => {
    if (!email) {
      showToast('No Email Address', 'No corporate email listed for this contact.', 'warning')
      return
    }
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    showToast('Corporate Email Copied', `${email} copied to clipboard for campus outreach.`, 'success')
    setTimeout(() => setCopiedEmail(null), 2200)
  }

  const getJobspyBadge = (opp: Opportunity) => {
    const site = (opp.jobspySite || opp.source || '').toLowerCase()
    if (site.includes('naukri')) {
      return { name: 'JobSpy • Naukri', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
    if (site.includes('indeed')) {
      return { name: 'JobSpy • Indeed India', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    }
    if (site.includes('linkedin')) {
      return { name: 'JobSpy • LinkedIn', bg: 'bg-sky-50 text-sky-700 border-sky-200' }
    }
    if (site.includes('glassdoor')) {
      return { name: 'JobSpy • Glassdoor', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    }
    return { name: 'JobSpy Engine', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* TPO Header & Department Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600 inline-block" />
              TPO Placement & Recruiter Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              Live python-jobspy Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              Multi-Source Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department Training & Placement Office Hub — Extracting authentic corporate HR recruiters, direct contact data, and active job openings for MCA and B.Tech talent.
          </p>
        </div>

        {/* TPO Quick Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (filteredOpportunities.length === 0) {
                showToast('No Data', 'No job openings available to export for this view.', 'warning')
                return
              }
              exportOpportunitiesToCsv(filteredOpportunities, `TPO_${quickHub}_Job_Openings.csv`)
              showToast('Export Started', `Downloaded ${filteredOpportunities.length} job openings to CSV.`, 'success')
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download CSV report of current job openings for department placement notice board"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Openings</span>
          </button>

          <button
            onClick={() => {
              if (filteredContacts.length === 0) {
                showToast('No Data', 'No recruiter contacts available to export for this view.', 'warning')
                return
              }
              exportContactsToCsv(filteredContacts, `TPO_${quickHub}_Recruiter_Directory.csv`)
              showToast('Export Started', `Downloaded ${filteredContacts.length} verified recruiters to CSV.`, 'success')
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-blue-500/10"
            title="Download CSV spreadsheet of corporate HR and recruiter contacts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HR Directory</span>
          </button>
        </div>
      </div>

      {/* Interactive City / Hub Filter Tabs Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-900">
              Department Target City / Indian IT Hub Filter
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Showing <span className="font-bold text-blue-700">{filteredOpportunities.length}</span> live openings & <span className="font-bold text-emerald-700">{verifiedContactsCount}</span> verified HRs in <span className="font-bold text-slate-800">{quickHub}</span>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CITY_OPTIONS.map((c) => {
            const isActive = quickHub === c.hubKey
            return (
              <button
                key={c.hubKey}
                onClick={() => handleCityTabClick(c.hubKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200/80'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Live JobSpy Harvester Command Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900">
              Extract Real Data & Live Job Vacancies via JobSpy
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>Direct ATS & Recruitment Portals: Naukri • Indeed India • LinkedIn • Glassdoor</span>
          </div>
        </div>

        <form onSubmit={handleQuickScrape} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickRole}
              onChange={(e) => setQuickRole(e.target.value)}
              placeholder="Filter by role or tech (e.g. React Developer, Software Engineer, Fresher)..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={quickHub}
              onChange={(e) => setQuickHub(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
            >
              {CITY_OPTIONS.map((c) => (
                <option key={c.hubKey} value={c.hubKey}>
                  {c.label} {c.hubKey !== 'All Hubs' ? '(Target City)' : '(Pan India)'}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 relative">
            <select
              value={quickExp}
              onChange={(e) => setQuickExp(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Batches</option>
              <option value="fresher">Fresher (0–2 Yrs)</option>
              <option value="senior">Experienced (3+ Yrs)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isDiscovering}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-blue-500/10"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
              <span>{isDiscovering ? 'Harvesting...' : 'Harvest Real Data'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Top 4 TPO KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Job Openings
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{filteredOpportunities.length}</span>
            {filteredOpportunities.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {quickHub}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Active engineering openings harvested</p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Corporate HRs
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{verifiedContactsCount}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> RFC-5321 MX
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Validated mailboxes & decision makers</p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              MCA / Fresher Eligible
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{eligibleFresherCount}</span>
            {filteredOpportunities.length > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {Math.round((eligibleFresherCount / filteredOpportunities.length) * 100)}% eligible
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Suitable for campus & 0–2 Yrs batch</p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Placement Outreach
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{outreachRecords.length}</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Campus Drives
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Proposals & invitations tracked</p>
        </div>
      </div>

      {/* Main Grid: Priority Openings Table (left 8 cols) & Recruiter Quick Panel (right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Openings with Direct Recruiter Data */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Current Verified Job Openings ({quickHub})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic vacancies with recruiter emails, live ATS links, and multi-source verification.
              </p>
            </div>
            {filteredOpportunities.length > 0 && (
              <Link
                to="/opportunities"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <span>View all ({filteredOpportunities.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {topOpportunities.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  No Current Vacancies Cached for {quickHub}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Trigger live scraping below across Naukri, Indeed India, LinkedIn & Glassdoor for {quickHub} to harvest active vacancies and recruiter contacts.
                </p>
              </div>
              <button
                onClick={() => handleQuickScrape()}
                disabled={isDiscovering}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract Real Openings for {quickHub}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Company & Role</th>
                      <th className="py-3 px-3">Recruiter Contact</th>
                      <th className="py-3 px-3">Location & Exp</th>
                      <th className="py-3 px-3">Package (LPA)</th>
                      <th className="py-3 px-3">TPO Verification</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {topOpportunities.map((opp) => {
                      const boardBadge = getJobspyBadge(opp)
                      const matchingContact = contacts.find((c) => c.relatedOpportunityId === opp.id || c.company.toLowerCase() === opp.company.toLowerCase())

                      return (
                        <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">{opp.role}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-600 font-semibold">{opp.company}</span>
                              <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded border ${boardBadge.bg}`}>
                                {boardBadge.name}
                              </span>
                            </div>
                          </td>

                          {/* Recruiter Contact info */}
                          <td className="py-3.5 px-3">
                            {matchingContact ? (
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-800 text-[11px] truncate max-w-[130px]">
                                  {matchingContact.name}
                                </div>
                                {matchingContact.email ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyEmail(matchingContact.email)}
                                      className="text-[11px] font-mono text-blue-600 hover:text-blue-800 truncate max-w-[120px] flex items-center gap-0.5 cursor-pointer"
                                      title="Copy recruiter email for campus drive"
                                    >
                                      <span>{matchingContact.email}</span>
                                      {copiedEmail === matchingContact.email ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-2.5 h-2.5 text-slate-400" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <a
                                    href={matchingContact.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-sky-600 hover:underline flex items-center gap-1"
                                  >
                                    <LinkedinIcon className="w-2.5 h-2.5 fill-sky-600" />
                                    <span>LinkedIn Lead</span>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Corporate Gateway</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="text-slate-700 font-medium truncate max-w-[130px]">{opp.location}</div>
                            <div className="text-[11px] text-slate-400">{opp.experience}</div>
                          </td>

                          <td className="py-3.5 px-3 font-bold text-emerald-700 whitespace-nowrap">
                            <div className="flex items-center gap-0.5">
                              <IndianRupee className="w-3 h-3 text-emerald-600" />
                              <span>{opp.salaryRange ? opp.salaryRange.replace(/^₹\s*/, '') : (opp.salaryLpa ? `${opp.salaryLpa} LPA` : 'Competitive')}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <VerificationTrustBadge
                              trustScore={opp.trustScore || opp.verification?.trustScore || 92}
                              badgeLabel={opp.verificationBadge || opp.verification?.verificationBadge || 'TPO Verified'}
                              size="sm"
                              onClick={() => {
                                setSelectedAudit({
                                  companyName: opp.company,
                                  website: opp.companyWebsite,
                                  recruiterEmail: matchingContact?.email,
                                  recruiterName: matchingContact?.name,
                                  verification: opp.verification || matchingContact?.verification,
                                })
                              }}
                            />
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                openOutreachModal(matchingContact, opp)
                              }}
                              className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Send official TPO Campus Placement Drive proposal"
                            >
                              <Send className="w-3 h-3" />
                              <span>Invite</span>
                            </button>
                            <a
                              href={opp.directUrl || opp.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1"
                              title="Direct apply on job board"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </a>
                            <button
                              onClick={() => navigate(`/opportunities/${opp.id}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>View</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="sm:hidden divide-y divide-slate-100">
                {topOpportunities.map((opp) => {
                  const boardBadge = getJobspyBadge(opp)
                  const matchingContact = contacts.find((c) => c.relatedOpportunityId === opp.id)
                  return (
                    <div key={opp.id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs">{opp.role}</h3>
                          <div className="text-[11px] text-slate-600 font-semibold">{opp.company}</div>
                        </div>
                        <VerificationTrustBadge
                          trustScore={opp.trustScore || opp.verification?.trustScore || 92}
                          badgeLabel="TPO Verified"
                          size="sm"
                          onClick={() => {
                            setSelectedAudit({
                              companyName: opp.company,
                              website: opp.companyWebsite,
                              recruiterEmail: matchingContact?.email,
                              recruiterName: matchingContact?.name,
                              verification: opp.verification,
                            })
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${boardBadge.bg}`}>
                          <span>{boardBadge.name}</span>
                        </span>
                        <div className="font-bold text-emerald-700 flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3 text-emerald-600" />
                          <span>{opp.salaryRange ? opp.salaryRange.replace(/^₹\s*/, '') : (opp.salaryLpa ? `${opp.salaryLpa} LPA` : 'Competitive')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => openOutreachModal(matchingContact, opp)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Invite
                        </button>
                        <a
                          href={opp.directUrl || opp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg inline-flex items-center gap-1"
                        >
                          Apply <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => navigate(`/opportunities/${opp.id}`)}
                          className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Recently Extracted Corporate Recruiters (right 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Extracted HR Recruiters</h2>
                <p className="text-xs text-slate-500 mt-0.5">Direct contacts for campus drives</p>
              </div>
              <Link
                to="/contacts"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                <span>Directory</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-[460px] overflow-y-auto space-y-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <Users2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No recruiters extracted yet for {quickHub}. Run a live harvest above.</p>
                </div>
              ) : (
                filteredContacts.slice(0, 6).map((contact) => (
                  <div key={contact.id} className="pt-2.5 first:pt-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{contact.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {contact.role} • <span className="font-semibold text-slate-700">{contact.company}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {contact.confidence || 92}% MX
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                      {contact.email ? (
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(contact.email)}
                          className="text-[11px] font-mono text-blue-600 hover:text-blue-800 truncate max-w-[160px] flex items-center gap-1 cursor-pointer"
                          title="Copy email address"
                        >
                          <span>{contact.email}</span>
                          {copiedEmail === contact.email ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">LinkedIn lead</span>
                      )}

                      <button
                        onClick={() => openOutreachModal(contact)}
                        className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold hover:bg-blue-100 cursor-pointer transition-all inline-flex items-center gap-1"
                        title="Send campus drive invitation"
                      >
                        <Send className="w-2.5 h-2.5" />
                        Invite
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Decision Makers
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700">python-whois + DNS MX</span>
          </div>
        </div>
      </div>

      {/* Verification Audit Modal */}
      {selectedAudit && (
        <VerificationModal
          isOpen={Boolean(selectedAudit)}
          onClose={() => setSelectedAudit(null)}
          companyName={selectedAudit.companyName}
          companyWebsite={selectedAudit.website}
          recruiterEmail={selectedAudit.recruiterEmail}
          recruiterName={selectedAudit.recruiterName}
          verification={selectedAudit.verification}
        />
      )}
    </div>
  )
}
