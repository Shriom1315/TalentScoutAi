import React, { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  Copy,
  Check,
  Mail,
  Send,
  Save,
  CheckCircle2,
  Info,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { outreachService } from '../../services/outreachService'
import { Outreach, OutreachStatus } from '../../types'

export const OutreachModal: React.FC = () => {
  const {
    activeOutreachModal,
    closeOutreachModal,
    saveOutreachRecord,
    showToast,
  } = useApp()

  const [isGenerating, setIsGenerating] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<OutreachStatus>('ready')
  const [whyGenerated, setWhyGenerated] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const contact = activeOutreachModal?.contact
  const opp = activeOutreachModal?.opportunity
  const existingOutreach = activeOutreachModal?.outreach

  useEffect(() => {
    if (!activeOutreachModal) return

    if (existingOutreach) {
      setSubject(existingOutreach.subject)
      setBody(existingOutreach.body)
      setStatus(existingOutreach.status)
      setWhyGenerated(existingOutreach.keyPoints || [])
      return
    }

    if (contact && opp) {
      setIsGenerating(true)
      outreachService
        .generatePersonalizedOutreach(contact, opp, 'Shriom')
        .then((res) => {
          setSubject(res.subject)
          setBody(res.fullBody)
          setWhyGenerated(res.whyGenerated)
          setStatus('ready')
        })
        .finally(() => {
          setIsGenerating(false)
        })
    }
  }, [activeOutreachModal, contact, opp, existingOutreach])

  if (!activeOutreachModal) return null

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    showToast('Copied to Clipboard', 'Outreach subject and body copied.', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const newRecord: Outreach = {
      id: existingOutreach?.id || `out-${Date.now()}`,
      contactId: contact?.id || existingOutreach?.contactId || 'unknown',
      opportunityId: opp?.id || existingOutreach?.opportunityId || 'unknown',
      company: opp?.company || contact?.company || existingOutreach?.company || 'Target Company',
      contactName: contact?.name || existingOutreach?.contactName || 'Hiring Lead',
      contactRole: contact?.role || existingOutreach?.contactRole || 'Decision Maker',
      jobTitle: opp?.role || existingOutreach?.jobTitle || 'Engineering Role',
      subject,
      body,
      status,
      createdAt: existingOutreach?.createdAt || 'Just now',
      followUpDate: 'In 3 days',
      keyPoints: whyGenerated,
    }
    saveOutreachRecord(newRecord)
    closeOutreachModal()
  }

  const handleOpenMail = () => {
    const recipientEmail = contact?.email || ''
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')
    showToast('Mail Client Opened', 'Opening your default email client with pre-filled pitch.', 'info')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                AI Personalized Outreach Assistant
              </h3>
              <p className="text-xs text-slate-500">
                To: {contact?.name || 'Contact'} ({contact?.role || 'Lead'}) •{' '}
                {opp?.company || 'Company'}
              </p>
            </div>
          </div>
          <button
            onClick={closeOutreachModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isGenerating ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Analyzing company & engineering stack...
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Synthesizing MCA graduate profile, verified hiring manager priorities, and tailored
                proof-of-skill prototype link.
              </p>
            </div>
          ) : (
            <>
              {/* Why this message was generated */}
              {whyGenerated.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
                  <div className="font-semibold text-blue-900 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Why this personalized pitch was generated:
                  </div>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {whyGenerated.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Subject line input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-2xs"
                  placeholder="Subject line..."
                />
              </div>

              {/* Message body textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Message Pitch (Proof-of-Skill Model)</span>
                  <span className="text-[11px] font-normal text-slate-400">Editable preview</span>
                </label>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-sans text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed shadow-2xs font-mono"
                  placeholder="Email body..."
                />
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-slate-600">Campaign Status</label>
                <div className="flex items-center gap-1.5">
                  {(['draft', 'ready', 'sent'] as OutreachStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium capitalize transition-colors ${
                        status === st
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zero-spam reminder notice */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Safety & Ethics:</span> TalentScout AI never sends
                  automated blast spam. Review this draft, ensure your prototype link works, and
                  open in your mail client or copy to LinkedIn DM.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {contact?.email && (
              <button
                type="button"
                onClick={handleOpenMail}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Mail Client</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Outreach</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
