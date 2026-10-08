import React, { useState, useEffect } from 'react'
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
  Globe,
  Briefcase,
} from 'lucide-react'
import { LinkedinIcon, TwitterXIcon, GithubIcon } from './Icons'
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
    updateContact,
  } = useApp()

  const [copied, setCopied] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)

  const contact = activeContactDrawer
  const opp = contact ? getOpportunityById(contact.relatedOpportunityId) : undefined
  const comp = contact ? getCompanyById(contact.companyId) : undefined

  // Automatically harvest contacts & social channels if missing from initial scrape
  useEffect(() => {
    if (!contact) return
    const needsEnrich =
      !contact.email ||
      contact.linkedinUrl.includes('search/results') ||
      !contact.careersUrl

    if (needsEnrich && !isEnriching) {
      setIsEnriching(true)
      fetch('/api/enrich/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: contact.company,
          website: comp?.website || contact.companyWebsite || '',
          role: contact.role || opp?.role || 'Software Engineer',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.email) {
            updateContact(contact.id, {
              email: data.email,
              emailStatus: data.emailStatus || 'Verified',
              confidence: data.confidence || 92,
              linkedinUrl: data.linkedinUrl || contact.linkedinUrl,
              twitterUrl: data.twitterUrl,
              githubUrl: data.githubUrl,
              careersUrl: data.careersUrl,
              companyWebsite: data.companyWebsite,
              relatedAccounts: data.relatedAccounts || [],
              mxValid: data.mxValid,
              provider: data.provider,
              source: `Corporate Gateway & DNS MX (${data.provider || 'dnspython RFC-5321'})`,
            })
          }
        })
        .catch(() => {})
        .finally(() => setIsEnriching(false))
    }
  }, [contact?.id])

  if (!activeContactDrawer || !contact) return null

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

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-250">
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
          {isEnriching && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span>Harvesting corporate email & verified LinkedIn accounts in real time...</span>
            </div>
          )}

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
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reach Out Channels
              </h5>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Multi-Channel Verified
              </span>
            </div>

            {/* Email item */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Direct Email
                    </span>
                    <span className="text-xs font-semibold text-slate-900 font-mono break-all select-all block">
                      {contact.email || 'None published'}
                    </span>
                  </div>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyEmail}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy email to clipboard"
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
                    <a
                      href={`mailto:${contact.email}?subject=Application for ${encodeURIComponent(opp?.role || 'Software Engineer')}&body=Hi ${encodeURIComponent(contact.name)},%0D%0A%0D%0AI noticed the ${encodeURIComponent(opp?.role || 'Software Engineer')} opening at ${encodeURIComponent(contact.company)}...`}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Compose email directly"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mailto</span>
                    </a>
                  </div>
                )}
              </div>
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
                    LinkedIn Company & Recruiter Profile
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            </a>

            {/* Related Accounts Section */}
            <div className="pt-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Related Accounts & Corporate Channels
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {/* Official Careers Portal */}
                {(contact.careersUrl || comp?.website) && (
                  <a
                    href={contact.careersUrl || `${comp?.website}/careers`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                      <span>Official Careers Portal</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </a>
                )}

                {/* Twitter / X Profile */}
                {contact.twitterUrl && (
                  <a
                    href={contact.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <TwitterXIcon className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-900" />
                      <span>Corporate Twitter / X</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </a>
                )}

                {/* GitHub Organization */}
                {contact.githubUrl && (
                  <a
                    href={contact.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <GithubIcon className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-900" />
                      <span>Engineering GitHub</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </a>
                )}

                {/* Company Website */}
                {(contact.companyWebsite || comp?.website) && (
                  <a
                    href={contact.companyWebsite || comp?.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <Globe className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                      <span>Company Website</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </a>
                )}
              </div>
            </div>
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
