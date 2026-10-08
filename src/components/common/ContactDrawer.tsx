import React, { useState } from 'react'
import {
  X,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  Building,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react'
import { LinkedinIcon } from './Icons'
import { useApp } from '../../context/AppContext'
import { EmailStatusBadge } from './Badge'

export const ContactDrawer: React.FC = () => {
  const {
    activeContactDrawer,
    closeContactDrawer,
    getOpportunityById,
    getCompanyById,
    openOutreachModal,
    showToast,
    verifyContactEmail,
  } = useApp()

  const [copied, setCopied] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)


  if (!activeContactDrawer) return null

  const contact = activeContactDrawer
  const opp = getOpportunityById(contact.relatedOpportunityId)
  const comp = getCompanyById(contact.companyId)

  const handleCopyEmail = () => {
    if (!contact.email) {
      showToast('No Email Address', 'This contact only has LinkedIn connection info.', 'warning')
      return
    }
    navigator.clipboard.writeText(contact.email)
    setCopied(true)
    showToast('Email Copied', `${contact.email} copied to clipboard.`, 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLiveVerify = async () => {
    if (!contact.email) return
    setIsVerifying(true)
    await verifyContactEmail(contact.id, contact.email)
    setIsVerifying(false)
  }

  const handlePrepareOutreach = () => {
    openOutreachModal(contact, opp)
    closeContactDrawer()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={closeContactDrawer} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
              Contact Intelligence
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Verified Decision Maker</h3>
          </div>
          <button
            onClick={closeContactDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contact Identity Header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {contact.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-slate-900 truncate">{contact.name}</h4>
              <p className="text-xs font-medium text-slate-600 mt-0.5">{contact.role}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">{contact.company}</span>
                {contact.location && <span>• {contact.location}</span>}
              </div>
            </div>
          </div>

          {/* Verification & Quality Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Email Verification</span>
              <EmailStatusBadge status={contact.emailStatus} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Confidence Score</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {contact.confidence}% Verified
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/70 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Verification Source
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{contact.source}</span>
              </div>
              {contact.verifiedAt && (
                <span className="text-[10px] text-slate-400 block mt-1">
                  Checked: {contact.verifiedAt}
                </span>
              )}

              {contact.email && (
                <button
                  onClick={handleLiveVerify}
                  disabled={isVerifying}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Resolving DNS MX Records...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Re-verify DNS MX in Real Time</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Why this person is relevant */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Why Contact Them
            </h5>
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100/90 text-xs text-slate-700 leading-relaxed">
              {contact.whyRelevant}
            </div>
          </div>

          {/* Contact Details & Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reach Out Channels
            </h5>

            {/* Email item */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Direct Email
                  </span>
                  <span className="text-xs font-medium text-slate-800 font-mono truncate block">
                    {contact.email || 'None published'}
                  </span>
                </div>
              </div>
              {contact.email && (
                <button
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* LinkedIn link */}
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5] shrink-0">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Professional Network
                  </span>
                  <span className="text-xs font-medium text-slate-800 truncate block">
                    LinkedIn Profile
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            </a>
          </div>

          {/* Related Opportunity snippet */}
          {opp && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Associated Active Role
              </h5>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{opp.role}</div>
                  <div className="text-[11px] text-slate-500">
                    {opp.location} • {opp.matchScore}% Match
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {opp.employmentType}
                </span>
              </div>
            </div>
          )}

          {/* Safe outreach reminder */}
          <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              TalentScout AI adheres to zero-spam standards. Emails are verified from public company
              records and DNS MX checks for personalized, professional job applications.
            </span>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
          <button
            onClick={handlePrepareOutreach}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Generate Outreach</span>
          </button>
          <button
            onClick={closeContactDrawer}
            className="py-2.5 px-4 border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
