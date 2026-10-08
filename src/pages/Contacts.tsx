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
} from 'lucide-react'
import { LinkedinIcon } from '../components/common/Icons'
import { useApp } from '../context/AppContext'
import { EmailStatusBadge } from '../components/common/Badge'
import { Contact } from '../types'


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
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedRoleType, setSelectedRoleType] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

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
    { id: 'founder', label: 'Founders / CEOs' },
    { id: 'engineering', label: 'Engineering Leads' },
    { id: 'recruiter', label: 'Tech Recruiters & HR' },
  ]

  const handleCopyEmail = (contactId: string, email: string) => {
    if (!email) {
      showToast('No Email Address', 'This contact only has LinkedIn connection info.', 'warning')
      return
    }
    navigator.clipboard.writeText(email)
    setCopiedId(contactId)
    showToast('Email Copied', `${email} copied to clipboard.`, 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
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
  }, [contacts, search, selectedStatus, selectedRoleType])

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hiring & Recruiter Contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified decision makers from legitimate public startup sources with zero guesswork.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openDiscoveryModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Contacts</span>
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Strict Verification & Zero-Spam Guarantee
            </div>
            <div className="text-[11px] text-slate-500">
              Every contact is extracted from publicly accessible records (engineering blogs, DNS MX checks, public speaker decks). Guessed emails are never presented as verified.
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 shrink-0">
          RFC 5321 Checked
        </span>
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
              placeholder="Search by name, company, or job role..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
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
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          {statusFilterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
          Showing <strong className="text-slate-800">{filteredContacts.length}</strong> verified
          contacts
        </span>
        <span className="font-mono text-[11px]">Click any contact to open intelligence drawer</span>
      </div>

      {/* Contacts List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Empty state */}
        {filteredContacts.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No verified contacts found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try changing the search query or status filters, or run a new scan to discover hiring
              contacts.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedStatus('all')
                setSelectedRoleType('all')
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
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
                  <th className="py-3 px-4">Decision Maker</th>
                  <th className="py-3 px-3">Company & Role</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Public Source</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-4 text-right">Outreach Actions</th>
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
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[180px]">{contact.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans">LinkedIn Only</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <EmailStatusBadge status={contact.emailStatus} size="sm" />
                      </td>

                      <td className="py-3.5 px-3 text-[11px] text-slate-500 max-w-[180px] truncate">
                        {contact.source}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {contact.confidence}%
                        </span>
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

                        {contact.email && (
                          <button
                            onClick={() => handleCopyEmail(contact.id, contact.email)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="Copy Email"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
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
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Outreach</span>
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
                    <EmailStatusBadge status={contact.emailStatus} size="sm" />
                  </div>

                  <div className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {contact.email || 'LinkedIn Connection only'}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Confidence: {contact.confidence}%</span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openContactDrawer(contact)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openOutreachModal(contact, opp)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                      >
                        Outreach
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
