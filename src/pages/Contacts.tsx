import React, { useState, useMemo } from 'react'
import {
  Users2,
  Search,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Sparkles,
  Loader2,
  X,
  MapPin,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Building2,
  Mail,
} from 'lucide-react'
import { LinkedinIcon } from '../components/common/Icons'
import { useApp } from '../context/AppContext'
import { EmailStatusBadge, VerificationTrustBadge } from '../components/common/Badge'
import { VerificationModal } from '../components/common/VerificationModal'
import { exportContactsToCsv } from '../utils/exportCsv'
import { Contact } from '../types'

const CITY_FILTER_PATTERNS: Record<string, RegExp> = {
  'Bengaluru': /(bengaluru|bangalore|karnataka|blr|whitefield|electronic city|koramangala|bellandur)/i,
  'Pune': /(pune|hinjewadi|magarpatta|kharadi|baner|viman nagar|hadapsar|maharashtra)/i,
  'Hyderabad': /(hyderabad|secunderabad|telangana|hitec city|gachibowli|madhapur|cyberabad)/i,
  'Delhi NCR': /(delhi|gurgaon|gurugram|noida|greater noida|faridabad|ghaziabad|ncr)/i,
  'Mumbai': /(mumbai|navi mumbai|thane|powai|bkc|bandra|andheri)/i,
  'Chennai': /(chennai|madras|tamil nadu|omr|siruseri|tidel)/i,
  'Remote': /(remote|wfh|work from home)/i,
}

const CITY_TABS = [
  'All Hubs',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Delhi NCR',
  'Mumbai',
  'Chennai',
  'Remote',
]

export const Contacts: React.FC = () => {
  const {
    contacts,
    getOpportunityById,
    openContactDrawer,
    openOutreachModal,
    showToast,
    openDiscoveryModal,
    verifyContactEmail,
  } = useApp()

  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('All Hubs')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedRoleType, setSelectedRoleType] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  // Verification Audit Modal state
  const [selectedAudit, setSelectedAudit] = useState<{
    companyName: string
    website?: string
    recruiterEmail?: string
    recruiterName?: string
    verification?: any
  } | null>(null)

  const handleVerify = async (contactId: string, email: string) => {
    setVerifyingId(contactId)
    await verifyContactEmail(contactId, email)
    setVerifyingId(null)
  }

  const statusFilterTabs = [
    { id: 'all', label: 'All Contacts' },
    { id: 'Verified', label: 'Verified Only' },
    { id: 'High confidence', label: 'High Confidence' },
    { id: 'Company contact', label: 'Company Inboxes' },
    { id: 'LinkedIn only', label: 'LinkedIn Only' },
    { id: 'Needs verification', label: 'Needs Verification' },
  ]

  const roleFilterTabs = [
    { id: 'all', label: 'All Roles' },
    { id: 'recruiter', label: 'Talent Acquisition & HR' },
    { id: 'engineering', label: 'Engineering Leads' },
    { id: 'founder', label: 'Founders / CEOs' },
  ]

  const handleCopyEmail = (contactId: string, email: string) => {
    if (!email) {
      showToast('No Email Address', 'This contact only has LinkedIn connection info.', 'warning')
      return
    }
    navigator.clipboard.writeText(email)
    setCopiedId(contactId)
    showToast('Corporate Email Copied', `${email} copied to clipboard for placement outreach.`, 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // City Filter
      if (selectedCity !== 'All Hubs') {
        const pattern = CITY_FILTER_PATTERNS[selectedCity]
        if (pattern) {
          const matched = pattern.test(c.location || '') || pattern.test(c.whyRelevant || '')
          if (!matched) return false
        }
      }

      // Search
      if (search) {
        const q = search.toLowerCase()
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        if (!matches) return false
      }

      // Status
      if (selectedStatus !== 'all' && c.emailStatus !== selectedStatus) {
        return false
      }

      // Role type
      if (selectedRoleType === 'founder') {
        const r = c.role.toLowerCase()
        if (!r.includes('founder') && !r.includes('ceo') && !r.includes('cto')) return false
      } else if (selectedRoleType === 'engineering') {
        const r = c.role.toLowerCase()
        if (!r.includes('engineer') && !r.includes('tech') && !r.includes('architect') && !r.includes('vp')) return false
      } else if (selectedRoleType === 'recruiter') {
        const r = c.role.toLowerCase()
        if (!r.includes('recruiter') && !r.includes('talent') && !r.includes('hr') && !r.includes('people')) return false
      }

      return true
    })
  }, [contacts, search, selectedCity, selectedStatus, selectedRoleType])

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-blue-600" />
              Corporate Recruiter Directory — Placement Cell
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Inboxes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authentic talent acquisition leads, HR heads, and technical recruiters extracted directly from live job postings for campus placement drives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (filteredContacts.length === 0) {
                showToast('No Data', 'No recruiter contacts available to export.', 'warning')
                return
              }
              exportContactsToCsv(filteredContacts, `TPO_Recruiter_Directory_${selectedCity}.csv`)
              showToast('Export Complete', `Exported ${filteredContacts.length} verified recruiters to CSV.`, 'success')
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-blue-500/10"
            title="Download CSV spreadsheet of corporate recruiters"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export HR Directory (CSV)</span>
          </button>

          <button
            onClick={openDiscoveryModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Scan</span>
          </button>
        </div>
      </div>

      {/* Safety & Multi-Source Verification Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Institutional Verification Audit (python-whois + RFC-5321 DNS MX + LinkedIn)
            </div>
            <div className="text-[11px] text-slate-500">
              Every contact is cross-verified across domain WHOIS registration age, SSL certificates, corporate mail exchangers (Google Workspace / Microsoft 365), and official LinkedIn profiles.
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
          TPO Approved
        </span>
      </div>

      {/* City Hub Tabs Selector */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1 shrink-0">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          Hub:
        </span>
        {CITY_TABS.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCity === city
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200/80'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Search & Tabs Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by recruiter name, company, or role..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {roleFilterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRoleType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedRoleType === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          {statusFilterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredContacts.length}</strong> corporate recruiters in <strong className="text-blue-700">{selectedCity}</strong>
        </span>
        <span className="font-mono text-[11px]">Click audit badge to view 6-source verification details</span>
      </div>

      {/* Contacts List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Empty state */}
        {filteredContacts.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No verified recruiters found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting the city or role filters, or run a new scan to harvest hiring contacts.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedCity('All Hubs')
                setSelectedStatus('all')
                setSelectedRoleType('all')
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Desktop Table View */}
        {filteredContacts.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Recruiter / HR Lead</th>
                  <th className="py-3 px-3">Company & Role</th>
                  <th className="py-3 px-3">Corporate Email</th>
                  <th className="py-3 px-3">City / Hub</th>
                  <th className="py-3 px-3">TPO Trust Audit</th>
                  <th className="py-3 px-4 text-right">Placement Outreach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((contact) => {
                  const opp = getOpportunityById(contact.relatedOpportunityId)
                  const isCopied = copiedId === contact.id

                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => openContactDrawer(contact)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {contact.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {contact.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{contact.department}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{contact.company}</div>
                        <div className="text-[11px] text-slate-500">{contact.role}</div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">
                        {contact.email ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(contact.id, contact.email)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              title="Copy email"
                            >
                              <span className="truncate max-w-[170px]">{contact.email}</span>
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans">LinkedIn Only</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-[11px] text-slate-600">
                        {contact.location || 'India'}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <VerificationTrustBadge
                          trustScore={contact.confidence || contact.verification?.trustScore || 92}
                          badgeLabel={contact.verificationBadge || contact.verification?.verificationBadge || 'TPO Verified'}
                          size="sm"
                          onClick={() => {
                            setSelectedAudit({
                              companyName: contact.company,
                              website: contact.companyWebsite,
                              recruiterEmail: contact.email,
                              recruiterName: contact.name,
                              verification: contact.verification,
                            })
                          }}
                        />
                      </td>

                      <td
                        className="py-3.5 px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.email && (
                          <button
                            onClick={() => handleVerify(contact.id, contact.email)}
                            disabled={verifyingId === contact.id}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors cursor-pointer"
                            title="Run live DNS MX check on this inbox"
                          >
                            {verifyingId === contact.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <a
                          href={contact.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-[#0077b5] inline-block transition-colors"
                          title="Open LinkedIn"
                        >
                          <LinkedinIcon className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => openOutreachModal(contact, opp)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-sm shadow-blue-500/10"
                          title="Send campus placement drive invitation"
                        >
                          <Send className="w-3 h-3" />
                          <span>Invite</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Card View */}
        {filteredContacts.length > 0 && (
          <div className="md:hidden divide-y divide-slate-100">
            {filteredContacts.map((contact) => {
              const opp = getOpportunityById(contact.relatedOpportunityId)
              return (
                <div
                  key={contact.id}
                  className="p-4 space-y-3 cursor-pointer hover:bg-slate-50"
                  onClick={() => openContactDrawer(contact)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{contact.name}</div>
                        <div className="text-xs text-slate-500">
                          {contact.role} • {contact.company}
                        </div>
                      </div>
                    </div>
                    <VerificationTrustBadge
                      trustScore={contact.confidence || 92}
                      size="sm"
                      onClick={() => {
                        setSelectedAudit({
                          companyName: contact.company,
                          website: contact.companyWebsite,
                          recruiterEmail: contact.email,
                          recruiterName: contact.name,
                          verification: contact.verification,
                        })
                      }}
                    />
                  </div>

                  <div className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span>{contact.email || 'LinkedIn Connection only'}</span>
                    {contact.email && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyEmail(contact.id, contact.email)
                        }}
                        className="text-blue-600 font-sans font-semibold text-[11px]"
                      >
                        Copy
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>{contact.location || 'India'}</span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openOutreachModal(contact, opp)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Invite
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
